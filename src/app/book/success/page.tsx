interface SuccessPageProps {
  searchParams: {
    bookingId?: string;
    mode?: string;
  };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const bookingId = searchParams.bookingId;
  const mode = searchParams.mode;
  const isOffline = mode === "offline";

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
          {isOffline ? "Request received" : "Payment complete"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {isOffline
            ? "Thank you – your booking request has been submitted."
            : "Thank you – your deposit has been received."}
        </h1>
      </header>
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        {isOffline ? (
          <p className="text-sm text-zinc-700">
            We&apos;ve received your booking details. We&apos;ll review
            availability and email you with confirmation and payment
            instructions as soon as possible.
          </p>
        ) : (
          <p className="text-sm text-zinc-700">
            We&apos;ve received your booking details and deposit payment. We&apos;ll
            review the information and send a confirmation email with next steps
            as soon as possible.
          </p>
        )}
        {bookingId && (
          <p className="text-xs font-medium text-zinc-700">
            Your booking reference:{" "}
            <span className="font-semibold">
              #{bookingId.toString().padStart(5, "0")}
            </span>
          </p>
        )}
        <p className="text-xs text-zinc-500">
          If you have any urgent questions or need to make changes, please reply
          to your confirmation email or use the contact details on the FAQ &
          Contact page.
        </p>
      </div>
    </section>
  );
}

