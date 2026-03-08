import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmationEmail,
  sendNewBookingNotificationToAdmin,
} from "@/lib/email";
import { BookingStatus } from "@/generated/prisma/enums";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe =
  stripeSecretKey &&
  new Stripe(stripeSecretKey, {
    apiVersion: "2026-02-25.clover",
  });

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature header." },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook error", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const amountTotal = session.amount_total ?? 0;
      const currency = session.currency ?? "usd";
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      const booking = await prisma.booking.update({
        where: { id: Number(bookingId) },
        data: {
          status: BookingStatus.CONFIRMED,
          amountPaid: Math.round(amountTotal / 100),
          currency,
          stripePaymentIntentId: paymentIntentId ?? undefined,
        },
      });

      await Promise.allSettled([
        sendBookingConfirmationEmail({
          to: booking.clientEmail,
          clientName: booking.clientName,
          bookingId: booking.id,
        }),
        sendNewBookingNotificationToAdmin({
          bookingId: booking.id,
          summary: `${booking.clientName} – ${booking.eventType} on ${new Date(
            booking.eventDate,
          ).toLocaleDateString()} at ${booking.venueName}`,
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

