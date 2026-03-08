export default function Home() {
  return (
    <section className="grid gap-10 md:grid-cols-[2fr,1.4fr] md:items-center">
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Professional choir • Live music
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Soulful choral music for weddings and special events.
        </h1>
        <p className="max-w-xl text-balance text-base text-zinc-600">
          KoroSeraphim brings rich vocal harmony, curated repertoire, and a
          stress-free booking experience to your ceremony, reception, corporate
          function, or memorial service.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="/book"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            Check availability & book
          </a>
          <a
            href="/repertoire"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-white"
          >
            Explore repertoire
          </a>
        </div>
        <div className="mt-4 grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-zinc-900">Weddings</p>
            <p>Processional, signing, and recessional music crafted for you.</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Corporate & gala</p>
            <p>Elegant background sets or feature performances.</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Funerals & memorials</p>
            <p>Respectful, comforting choral music to honour loved ones.</p>
          </div>
        </div>
      </div>
      <aside className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Why book KoroSeraphim
        </p>
        <ul className="space-y-3 text-sm text-zinc-700">
          <li>• Flexible ensembles from small groups to full choir.</li>
          <li>• Repertoire from classical and hymns to gospel and pop.</li>
          <li>• Professional planning support before your event.</li>
          <li>• Clear pricing and simple online booking.</li>
        </ul>
        <p className="pt-2 text-xs text-zinc-500">
          Tell us about your date, venue, and musical style, and we will confirm
          a tailored package for your event.
        </p>
      </aside>
    </section>
  );
}
