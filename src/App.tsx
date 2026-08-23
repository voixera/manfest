import Generator from "./components/Generator";

const topSupporters = ["n9f9", "lucassa0958", "ashleey_clifford", "leon.pr._"];
const recentSupporters = ["mafia.zaryab", "cq0369", "Anonymous", "Anonymous"];

export default function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#120d1b] text-[#f5efff]">
      <div className="aurora pointer-events-none fixed inset-0" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#a88bff] text-lg text-[#1d1230] shadow-[0_8px_30px_rgba(168,139,255,.32)]">V</span>
          <span className="text-lg">VXLua<span className="text-[#ae92ff]">Tools</span></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[#c9bedc] sm:flex">
          <a className="transition hover:text-white" href="#generator">Generator</a>
          <a className="transition hover:text-white" href="#services">Services</a>
          <a className="transition hover:text-white" href="#supporters">Supporters</a>
        </nav>
        <a href="#generator" className="rounded-full border border-white/15 bg-white/[.07] px-4 py-2 text-xs font-semibold transition hover:bg-white/[.13]">Open tools</a>
      </header>

      <div id="top" className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#ba9fff]/25 bg-[#a88bff]/[.09] px-3 py-1.5 text-[11px] font-medium text-[#d6c7ff]">
            <span className="size-1.5 rounded-full bg-[#abf08b] shadow-[0_0_10px_#abf08b]" />
            Steam manifest workspace
          </div>
          <h1 className="mt-6 font-serif text-5xl leading-[.96] tracking-[-.045em] text-white sm:text-7xl">
            Your shortcut to the<br /><span className="text-[#b79dff]">Steam library.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#c6bbd8]">
            Search a game, enter an AppID, and prepare a clean Lua manifest file in a few seconds.
          </p>
        </section>

        <section id="generator" className="relative mx-auto mt-12 max-w-4xl scroll-mt-8">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[#9e7cff]/10 blur-3xl" />
          <Generator />
        </section>

        <section id="services" className="mt-20 grid gap-4 sm:grid-cols-2">
          <a href="#generator" className="group rounded-2xl border border-white/[.09] bg-[#1b1328]/80 p-6 transition hover:-translate-y-1 hover:border-[#b89dff]/40 hover:bg-[#201630]">
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-[#aa8bff]/15 text-xl text-[#cbb9ff]">⌘</span>
              <span className="text-[#b69cff] transition group-hover:translate-x-1">→</span>
            </div>
            <h2 className="mt-8 text-lg font-semibold">Manifest generator</h2>
            <p className="mt-2 text-sm leading-6 text-[#b9aecb]">Find a public Steam entry and create a ready-to-use Lua file from its AppID.</p>
          </a>
          <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/[.09] bg-[#1b1328]/80 p-6 transition hover:-translate-y-1 hover:border-[#b89dff]/40 hover:bg-[#201630]">
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-[#ffbd74]/15 text-xl text-[#ffd1a0]">?</span>
              <span className="text-[#b69cff] transition group-hover:translate-x-1">↗</span>
            </div>
            <h2 className="mt-8 text-lg font-semibold">Need a game ID?</h2>
            <p className="mt-2 text-sm leading-6 text-[#b9aecb]">Open the Steam store and copy the number in a game page URL to begin.</p>
          </a>
        </section>

        <section id="supporters" className="mt-20 scroll-mt-8 rounded-3xl border border-white/[.09] bg-[#191123]/70 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b69cff]">Community board</p><h2 className="mt-2 font-serif text-3xl tracking-tight">Made brighter by supporters.</h2></div>
            <span className="text-sm text-[#b9aecb]">Thank you for keeping VXLuaTools online.</span>
          </div>
          <div className="mt-8 grid gap-7 md:grid-cols-2">
            <SupporterList title="Top supporters" names={topSupporters} accent />
            <SupporterList title="Recent supporters" names={recentSupporters} />
          </div>
        </section>
      </div>
      <footer className="relative z-10 border-t border-white/[.08] px-5 py-7 text-center text-xs text-[#9184a6] sm:px-8">
        <span>VXLuaTools · public Steam game lookup · not affiliated with Valve</span>
      </footer>
    </main>
  );
}

function SupporterList({ title, names, accent = false }: { title: string; names: string[]; accent?: boolean }) {
  return <div><h3 className="text-sm font-semibold text-[#ded4ee]">{title}</h3><div className="mt-3 divide-y divide-white/[.07]">{names.map((name, index) => <div key={`${name}-${index}`} className="flex items-center gap-3 py-3"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${accent ? "bg-[#aa8bff]/20 text-[#d5c7ff]" : "bg-white/[.07] text-[#c7bbd8]"}`}>{name === "Anonymous" ? "?" : name.slice(0, 1).toUpperCase()}</span><span className="text-sm text-[#d7cde5]">{name}</span>{accent && index === 0 && <span className="ml-auto rounded-full bg-[#ffca72]/15 px-2 py-1 text-[10px] font-semibold text-[#ffcf88]">TOP</span>}</div>)}</div></div>;
}
