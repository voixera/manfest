import Generator from "./components/Generator";

export default function App() {
  return (
    <main className="noise relative min-h-screen overflow-hidden bg-ink">
      <div className="grid-field pointer-events-none absolute inset-0 [mask-image:radial-gradient(95%_80%_at_60%_35%,#000_15%,transparent_75%)]" />
      <div className="pointer-events-none absolute left-[58%] top-[30%] h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/[0.045] blur-[130px]" />

      <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-line lg:block" />
      <div className="absolute bottom-0 right-5 top-0 hidden w-px bg-line lg:block" />
      <div className="absolute left-5 top-1/2 hidden -translate-x-1/2 -rotate-90 font-mono text-[9px] uppercase tracking-[0.28em] text-fog/35 xl:block">
        public steam index / games only
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="pixel text-xl leading-none text-signal">▞▚</span>
          <span className="font-mono text-[13px] tracking-[0.24em]">MANIFOLD</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fog/60">app id → lua</span>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-110px)] max-w-6xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20 lg:py-16">
        <section>
          <div className="rise flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
            <span className="h-1.5 w-1.5 bg-signal" />
            one input · one file
          </div>
          <h1 className="mt-7 text-[17vw] font-light leading-[0.8] tracking-[-0.055em] sm:text-[92px] lg:text-[86px]">
            Pull
            <br />
            <span className="text-fog">the</span>
            <br />
            <span className="italic text-signal">ID.</span>
          </h1>
          <p className="mt-7 max-w-xs text-[14px] leading-relaxed text-fog">
            Search the complete public Steam games index or paste any AppID. Generate a clean Lua starter immediately.
          </p>
          <div className="mt-7 h-px w-16 bg-signal" />
        </section>

        <section className="w-full">
          <Generator />
        </section>
      </div>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col gap-2 border-t border-line px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-fog/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Steam names + AppIDs synced from IStoreService via a daily public mirror</span>
        <span>Not affiliated with Valve · educational use</span>
      </footer>
    </main>
  );
}