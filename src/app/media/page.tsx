export default function MediaPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Media
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          See and hear the choir in action.
        </h1>
        <p className="max-w-2xl text-sm text-zinc-700">
          Embed your own performance videos, audio clips, and photos here to
          give clients a feel for your sound, energy, and presentation.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="aspect-video rounded-xl bg-zinc-100" />
          <p className="text-sm font-semibold text-zinc-900">
            Wedding processional (example video)
          </p>
          <p className="text-xs text-zinc-600">
            Replace this placeholder with a real YouTube, Vimeo, or direct video
            embed from a favourite performance.
          </p>
        </div>
        <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="aspect-video rounded-xl bg-zinc-100" />
          <p className="text-sm font-semibold text-zinc-900">
            Corporate gala feature (example video)
          </p>
          <p className="text-xs text-zinc-600">
            Use this area to showcase different event types – weddings,
            corporate, seasonal concerts, or recording projects.
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Photo highlights
        </h2>
        <p className="text-xs text-zinc-600">
          Add a simple gallery of 6–10 photos featuring different venues, choir
          formations, and dress codes so clients can imagine how KoroSeraphim will
          look at their event.
        </p>
      </div>
    </section>
  );
}

