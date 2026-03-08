export default function FaqContactPage() {
  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          FAQ & contact
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Answers to common questions – and how to reach us.
        </h1>
      </header>
      <div className="grid gap-10 md:grid-cols-[1.7fr,1.3fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              How far in advance should we book?
            </h2>
            <p className="mt-2 text-sm text-zinc-700">
              Popular dates – especially weekends during wedding season and
              December events – can book out months ahead. If your date is
              fixed, we recommend enquiring as early as possible, but we will
              always do our best with shorter notice.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Do you travel outside your home city?
            </h2>
            <p className="mt-2 text-sm text-zinc-700">
              Yes. Travel fees depend on distance, call times, and whether
              accommodation is required. Share your venue details in your
              booking request and we will include travel in your quote.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Can we request specific songs?
            </h2>
            <p className="mt-2 text-sm text-zinc-700">
              We maintain a core repertoire list and can usually accommodate a
              small number of special requests. Some custom arrangements may
              attract an arranging or rehearsal fee – we will confirm this in
              advance.
            </p>
          </div>
        </div>
        <aside className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900">
            Contact details
          </h2>
          <p className="text-sm text-zinc-700">
            Replace these placeholders with your real contact information so
            clients can get in touch directly.
          </p>
          <div className="space-y-1 text-sm text-zinc-700">
            <p>
              <span className="font-medium">Email:</span> hello@kschoir.example
            </p>
            <p>
              <span className="font-medium">Phone:</span> +00 000 000 000
            </p>
            <p>
              <span className="font-medium">Instagram:</span> @kschoir
            </p>
          </div>
          <p className="pt-2 text-xs text-zinc-500">
            Your dedicated booking form will live on the Book page – this
            section is for quick questions and general enquiries.
          </p>
        </aside>
      </div>
    </section>
  );
}

