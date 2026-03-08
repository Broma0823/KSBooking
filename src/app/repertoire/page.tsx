export default function RepertoirePage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Repertoire & services
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Music for ceremonies, receptions, and special events.
        </h1>
      </header>
      <div className="grid gap-10 md:grid-cols-[1.6fr,1.4fr]">
        <div className="space-y-6 text-sm text-zinc-700">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Wedding ceremonies
            </h2>
            <p>
              Processional, signing of the register, and recessional music
              tailored to your style – from traditional hymns and classical
              pieces to gospel and modern love songs arranged for choir.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Receptions & corporate events
            </h2>
            <p>
              Light background sets or feature performances for dinners, awards
              nights, product launches, and end-of-year celebrations.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Funerals & memorials
            </h2>
            <p>
              Gentle, respectful repertoire to honour loved ones, including
              hymns, classical works, and contemporary songs with special
              meaning for your family.
            </p>
          </section>
        </div>
        <aside className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900">
            Example packages
          </h2>
          <ul className="space-y-3 text-sm text-zinc-700">
            <li>
              <p className="font-semibold text-zinc-900">Silver Ceremony</p>
              <p>Small ensemble, up to 3 songs for your ceremony.</p>
            </li>
            <li>
              <p className="font-semibold text-zinc-900">Gold Ceremony +</p>
              <p>
                Ceremony music plus short set during drinks or photos, with
                additional song choices.
              </p>
            </li>
            <li>
              <p className="font-semibold text-zinc-900">Platinum Event</p>
              <p>
                Extended performance time, bespoke arrangements, and on-site
                musical direction.
              </p>
            </li>
          </ul>
          <p className="pt-2 text-xs text-zinc-500">
            Replace these package names, song examples, and price ranges with
            your real offerings.
          </p>
        </aside>
      </div>
    </section>
  );
}

