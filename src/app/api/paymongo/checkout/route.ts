import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/enums";

type CheckoutPayload = {
  eventDate: string;
  startTime: string;
  durationMinutes: number;
  eventType: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
  packageKey: "silver" | "gold" | "platinum";
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
};

const defaultPackages = [
  {
    key: "silver",
    name: "Silver Ceremony",
    description: "Small ensemble, up to 3 songs for your ceremony.",
    basePrice: 1_000,
    defaultDepositAmount: 300,
  },
  {
    key: "gold",
    name: "Gold Ceremony +",
    description:
      "Ceremony music plus a short set during drinks or photos, with additional song choices.",
    basePrice: 1_600,
    defaultDepositAmount: 500,
  },
  {
    key: "platinum",
    name: "Platinum Event",
    description:
      "Extended performance time, bespoke arrangements, and on-site musical direction.",
    basePrice: 2_500,
    defaultDepositAmount: 800,
  },
] as const;

async function ensureDefaultPackages() {
  const existingCount = await prisma.package.count();
  if (existingCount > 0) {
    return;
  }

  await prisma.package.createMany({
    data: defaultPackages.map((pkg) => ({
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice,
      defaultDepositAmount: pkg.defaultDepositAmount,
      isActive: true,
    })),
  });
}

export async function POST(request: Request) {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment is not configured yet. Please contact the choir." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as CheckoutPayload;

    if (!body.eventDate || !body.clientEmail || !body.clientName) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const eventDate = new Date(body.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(eventDate.getTime()) || eventDate < today) {
      return NextResponse.json(
        { error: "Please choose a future event date." },
        { status: 400 },
      );
    }

    await ensureDefaultPackages();

    const packageConfig = defaultPackages.find(
      (p) => p.key === body.packageKey,
    );

    if (!packageConfig) {
      return NextResponse.json(
        { error: "Invalid package selection." },
        { status: 400 },
      );
    }

    const packageRecord = await prisma.package.findFirst({
      where: { name: packageConfig.name, isActive: true },
    });

    if (!packageRecord) {
      return NextResponse.json(
        { error: "Package configuration not available." },
        { status: 500 },
      );
    }

    const booking = await prisma.booking.create({
      data: {
        status: BookingStatus.PENDING_PAYMENT,
        eventDate,
        startTime: body.startTime,
        durationMinutes: body.durationMinutes,
        eventType: body.eventType,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        guestCount: body.guestCount,
        packageId: packageRecord.id,
        basePrice: packageConfig.basePrice,
        depositAmount: packageConfig.defaultDepositAmount,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        notes: body.notes,
        currency: "PHP",
      },
    });

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const amountCentavos = packageConfig.defaultDepositAmount * 100;

    const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

    const payload = {
      data: {
        attributes: {
          payment_method_types: ["gcash"],
          line_items: [
            {
              amount: amountCentavos,
              currency: "PHP",
              name: `KoroSeraphim deposit – ${packageConfig.name}`,
              description: packageConfig.description,
              quantity: 1,
            },
          ],
          cancel_url: `${origin}/book/cancel?bookingId=${booking.id}`,
          success_url: `${origin}/book/success?bookingId=${booking.id}`,
          description: `KoroSeraphim booking deposit – #${booking.id.toString().padStart(5, "0")}`,
          reference_number: booking.id.toString(),
          billing: {
            name: body.clientName,
            email: body.clientEmail,
            phone: body.clientPhone,
            address: {
              line1: body.venueAddress,
              city: undefined,
              state: undefined,
              postal_code: undefined,
              country: "PH",
            },
          },
          metadata: {
            bookingId: booking.id.toString(),
            eventType: body.eventType,
          },
        },
      },
    };

    const response = await fetch(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("PayMongo error", response.status, errorBody);
      return NextResponse.json(
        { error: "Something went wrong while starting payment." },
        { status: 500 },
      );
    }

    const json = (await response.json()) as {
      data?: { attributes?: { checkout_url?: string } };
    };

    const checkoutUrl = json.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Unable to start payment at the moment." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        url: checkoutUrl,
        bookingId: booking.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating PayMongo Checkout session", error);
    return NextResponse.json(
      { error: "Something went wrong while starting payment." },
      { status: 500 },
    );
  }
}

