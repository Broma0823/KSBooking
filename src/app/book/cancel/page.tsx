interface CancelPageProps {
  searchParams: {
    bookingId?: string;
  };
}

export default function CancelPage({ searchParams }: CancelPageProps) {
  const bookingId = searchParams.bookingId;

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
          Payment cancelled
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your booking request is not yet confirmed.
        </h1>
      </header>
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm text-zinc-700">
          You closed the payment window before completing your deposit. If this
          was a mistake, you can restart the booking process or contact us and
          we&apos;ll help you complete the payment.
        </p>
        {bookingId && (
          <p className="text-xs font-medium text-zinc-700">
            Your provisional booking reference:{" "}
            <span className="font-semibold">
              #{bookingId.toString().padStart(5, "0")}
            </span>
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Until the deposit is received, your date is not fully secured.
        </p>
      </div>
    </section>
  );
}

