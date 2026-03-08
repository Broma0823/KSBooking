import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendBookingConfirmationEmail(params: {
  to: string;
  clientName: string;
  bookingId: number;
}) {
  if (!resend) {
    return;
  }

  const { to, clientName, bookingId } = params;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "KS Choir – Booking request received",
    text: [
      `Hi ${clientName},`,
      "",
      "Thank you for your booking request with KS Choir.",
      "We have received your details and deposit payment. We will review everything and confirm the final details with you shortly.",
      "",
      `Your booking reference: #${bookingId.toString().padStart(5, "0")}`,
      "",
      "If anything changes or you have questions, just reply to this email.",
      "",
      "Warm regards,",
      "KS Choir",
    ].join("\n"),
  });
}

export async function sendNewBookingNotificationToAdmin(params: {
  bookingId: number;
  summary: string;
}) {
  if (!resend || !process.env.ADMIN_EMAIL) {
    return;
  }

  const { bookingId, summary } = params;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.ADMIN_EMAIL,
    subject: `New KS Choir booking – #${bookingId.toString().padStart(5, "0")}`,
    text: [
      "A new booking has been created.",
      "",
      summary,
      "",
      "You can view this booking in the admin dashboard.",
    ].join("\n"),
  });
}

