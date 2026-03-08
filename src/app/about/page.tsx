export default function AboutPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          About the choir
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          KoroSeraphim – voices for your most important moments.
        </h1>
      </header>
      <div className="grid gap-10 md:grid-cols-[2fr,1.3fr]">
        <div className="space-y-5 text-sm leading-relaxed text-zinc-700">
          <p>
            KoroSeraphim is a professional vocal ensemble specialising in live music
            for weddings, corporate functions, concerts, and memorial services.
            We combine disciplined musicianship with warm, engaging performance
            to create moving musical moments for you and your guests.
          </p>
          <p>
            Our singers are experienced performers, comfortable in a wide
            variety of styles – from classical and sacred repertoire to gospel,
            jazz standards, and contemporary favourites. We work closely with
            you to choose music that reflects your story, traditions, and the
            atmosphere you want to create.
          </p>
          <p>
            From the first enquiry to the final chord, we prioritise clear
            communication, punctuality, and professionalism. Our goal is for
            you to feel completely confident about the music, so you can relax
            and enjoy your event.
          </p>
        </div>
        <aside className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-sm font-semibold text-zinc-900">
            What you can expect
          </h2>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>• Tailored set lists for your ceremony or event.</li>
            <li>• Flexible ensemble size to suit your venue and budget.</li>
            <li>• Professional coordination with your planner or officiant.</li>
            <li>• Reliable timekeeping and clear logistics planning.</li>
          </ul>
          <p className="pt-2 text-xs text-zinc-500">
            Content here is placeholder – update with your real story, names,
            and photos when you are ready.
          </p>
        </aside>
      </div>
    </section>
  );
}

