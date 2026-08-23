import Generator from "./components/Generator";

export default function App() {
  return (
    <main className="starfield min-h-screen overflow-hidden bg-[#09090d] text-[#f3f1f7]">
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-[#7650ee] text-sm text-white shadow-[0_6px_20px_rgba(118,80,238,.4)]">V</span>
          <span>VXLua<span className="text-[#9b7cff]">Tools</span></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[#c9bedc] sm:flex">
          <a className="transition hover:text-white" href="#generator">Generator</a>
          <a className="transition hover:text-white" href="#services">Services</a>
          <a className="transition hover:text-white" href="#supporters">Supporters</a>
        </nav>
        <a href="#generator" className="rounded-md border border-[#6139ad] bg-[#2a183f] px-3 py-1.5 text-xs font-semibold text-[#c7b1ff] transition hover:bg-[#372052]">Open tools</a>
      </header>

      <div id="top" className="relative z-10 mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <section className="mx-auto max-w-[560px] text-center">
          <p className="text-xs font-medium uppercase tracking-[.2em] text-[#9a7ae9]">Steam game lookup</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Find your Lua starter.</h1>
          <p className="mt-2 text-sm text-[#827d91]">Enter an AppID or search by game name.</p>
        </section>

        <section id="generator" className="mx-auto mt-8 max-w-[560px] scroll-mt-8 rounded-2xl border border-[#29262f] bg-[#141318]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,.45)] sm:p-7">
          <Generator />
        </section>
      </div>
      <footer className="relative z-10 px-5 py-7 text-center text-xs text-[#625d6d] sm:px-8">
        <span>VXLuaTools · public Steam game lookup · not affiliated with Valve</span>
      </footer>
    </main>
  );
}
