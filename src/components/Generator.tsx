import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  buildLua,
  FALLBACK_GAMES,
  findGames,
  loadSteamGames,
  steamHeader,
  type SteamGame,
} from "../data/steam";

type Phase = "idle" | "resolving" | "ready";
type IndexState = "loading" | "live" | "fallback";

const RESOLVE_STEPS = ["validate appid", "resolve title", "write lua", "checksum file"];

export default function Generator() {
  const [games, setGames] = useState<SteamGame[]>(FALLBACK_GAMES);
  const [indexState, setIndexState] = useState<IndexState>("loading");
  const [progress, setProgress] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState<SteamGame | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [output, setOutput] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    loadSteamGames((value) => live && setProgress(value))
      .then((fullIndex) => {
        if (!live) return;
        setGames(fullIndex);
        setIndexState("live");
      })
      .catch(() => {
        if (!live) return;
        setIndexState("fallback");
        setProgress(null);
      });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = useMemo(
    () => findGames(games, deferredQuery),
    [games, deferredQuery],
  );

  const numericGame = useMemo<SteamGame | null>(() => {
    const value = query.trim();
    if (!/^\d+$/.test(value)) return null;
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    return games.find((game) => game.id === id) ?? { id, name: `Steam App ${id}` };
  }, [games, query]);

  const candidate = selected ?? numericGame;

  function choose(game: SteamGame) {
    setSelected(game);
    setQuery(game.name);
    setOpen(false);
    setPhase("idle");
    setStep(0);
    setCopied(false);
    setImageFailed(false);
    setOutput("");
  }

  function generate() {
    if (!candidate || phase === "resolving") return;
    if (!selected) setSelected(candidate);
    setOutput(buildLua(candidate));
    setOpen(false);
    setPhase("resolving");
    setStep(0);
  }

  useEffect(() => {
    if (phase !== "resolving") return;
    if (step >= RESOLVE_STEPS.length) {
      const timeout = window.setTimeout(() => setPhase("ready"), 180);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => setStep((value) => value + 1), 190);
    return () => window.clearTimeout(timeout);
  }, [phase, step]);

  function download() {
    if (!candidate) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${candidate.id}.lua`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const statusText = indexState === "live"
    ? `${games.length.toLocaleString()} Steam games loaded`
    : indexState === "fallback"
      ? "Index offline · AppID input still works"
      : progress === null
        ? "Syncing Steam game index"
        : `Syncing full Steam index · ${Math.round(progress * 100)}%`;

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-white/[.11] bg-[#1d142b] shadow-[0_24px_70px_rgba(0,0,0,.25)]">
        <div className="relative flex items-center justify-between overflow-hidden border-b border-white/[.08] px-4 py-3">
          {indexState === "loading" && progress !== null && (
            <span
               className="absolute bottom-0 left-0 h-px bg-[#ab8dff] transition-[width] duration-300"
              style={{ width: `${Math.max(2, progress * 100)}%` }}
            />
          )}
             <span className="flex items-center gap-2 text-[11px] font-medium text-[#baaece]">
             <span className={`h-1.5 w-1.5 rounded-full ${indexState === "fallback" ? "bg-amber" : "bg-[#abf08b]"}`} />
            {statusText}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-fog/50 sm:block">
            games only · no dlc
          </span>
        </div>

           <div className="flex flex-col sm:flex-row">
           <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-5 sm:px-5">
             <span className="text-lg text-[#b99fff]">⌕</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(null);
                setPhase("idle");
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((value) => Math.min(value + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((value) => Math.max(value - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  if (open && results[active] && !numericGame) choose(results[active]);
                  else generate();
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Enter AppID or search every Steam game"
              spellCheck={false}
               className="w-full bg-transparent text-[15px] text-white placeholder:text-[#877a9a] sm:text-base"
            />
             {!query && <span className="caret -ml-2 h-[17px] w-[7px] bg-[#ad91ff]" />}
          </label>
          <button
            onClick={generate}
            disabled={!candidate || phase === "resolving"}
             className="group flex items-center justify-between gap-8 border-t border-white/[.08] px-5 py-4 text-xs font-semibold transition-colors enabled:bg-[#a98bff] enabled:text-[#211532] enabled:hover:bg-[#c0abff] disabled:cursor-not-allowed disabled:text-[#756887] sm:border-l sm:border-t-0"
          >
            {phase === "resolving" ? "resolving" : "generate lua"}
            <span className={phase === "resolving" ? "spin-half" : "transition-transform group-hover:translate-x-1"}>
              {phase === "resolving" ? "◩" : "↵"}
            </span>
          </button>
          </div>
        </div>

        {open && query.trim() && !selected && phase === "idle" && (
           <div className="rise absolute left-0 right-0 top-full z-30 -mt-px max-h-[374px] overflow-y-auto rounded-b-2xl border border-white/[.11] bg-[#211730] shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
          {numericGame && (
            <button
              onClick={() => choose(numericGame)}
              className="flex w-full items-center gap-4 border-b border-line bg-signal/[0.04] px-4 py-3 text-left hover:bg-signal/[0.08]"
            >
              <span className="flex h-9 w-[76px] items-center justify-center border border-signal/20 font-mono text-[10px] text-signal">APPID</span>
              <span className="flex-1 text-sm">Generate directly for AppID {numericGame.id}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-signal">select ↵</span>
            </button>
          )}
          {!numericGame && results.map((game, index) => (
            <button
              key={game.id}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(game)}
              className={`group flex w-full items-center gap-4 border-b border-line px-4 py-2.5 text-left last:border-b-0 ${active === index ? "bg-line/70" : ""}`}
            >
              <img
                src={steamHeader(game.id)}
                alt=""
                loading="lazy"
                className="h-9 w-[76px] object-cover opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
                onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{game.name}</span>
              <span className="font-mono text-[11px] text-signal">{game.id}</span>
            </button>
          ))}
          {!numericGame && results.length === 0 && (
            <div className="px-4 py-5 font-mono text-xs text-fog">
              {indexState === "loading"
                ? "The full Steam index is still syncing. You can enter an exact AppID now."
                : "No public Steam game matched this search."}
            </div>
          )}
          </div>
        )}
      </div>

      {selected && (
        <div className="rise -mt-px border border-line-2 bg-ink-2">
          <div className="grid sm:grid-cols-[190px_1fr]">
            <div className="relative hidden min-h-[90px] overflow-hidden border-r border-line sm:block">
              {!imageFailed ? (
                <img
                  key={selected.id}
                  src={steamHeader(selected.id)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-75 grayscale"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="absolute inset-0 grid-field" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-2" />
            </div>
            <div className="flex items-center justify-between gap-5 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="label">selected game</div>
                <div className="mt-1 truncate text-lg font-medium tracking-tight">{selected.name}</div>
                <div className="mt-1 font-mono text-[11px] text-signal">APPID {selected.id}</div>
              </div>
              {phase === "idle" && (
                <button
                  onClick={() => {
                    setSelected(null);
                    setQuery("");
                    setOutput("");
                  }}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog hover:text-chalk"
                >
                  clear ×
                </button>
              )}
            </div>
          </div>

          {phase === "resolving" && (
            <div className="border-t border-line px-4 py-3 sm:px-5">
              {RESOLVE_STEPS.map((label, index) => (
                <div key={label} className="flex items-center gap-3 py-1 font-mono text-[11px]">
                  <span className={index < step ? "text-signal" : "text-fog/25"}>{index < step ? "✓" : "○"}</span>
                  <span className={index < step ? "text-fog-2" : "text-fog/25"}>{label}</span>
                  <span className="dotted-line h-px flex-1" />
                  <span className={index < step ? "text-fog/50" : "text-fog/20"}>{index < step ? `${31 + index * 27}ms` : "···"}</span>
                </div>
              ))}
            </div>
          )}

          {phase === "ready" && (
            <div className="border-t border-line">
              <div className="flex items-center justify-between border-b border-line bg-ink-3 px-4 py-2 sm:px-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-fog">{selected.id}.lua</span>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-signal">
                  <span className="h-1.5 w-1.5 bg-signal" /> ready
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-[11px] leading-6 text-fog-2 sm:px-5">
                {output.split("\n").map((line, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="w-4 shrink-0 select-none text-right text-line-3">{index + 1}</span>
                    <span className={line.startsWith("--") ? "italic text-fog/55" : line.includes("addappid") ? "text-chalk" : ""}>
                      {line || " "}
                    </span>
                  </div>
                ))}
              </pre>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-fog/60">local file · readable · no telemetry</span>
                <div className="flex gap-2">
                  <button onClick={copy} className="border border-line-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-fog-2 hover:border-line-3 hover:text-chalk">
                    {copied ? "copied ✓" : "copy"}
                  </button>
                  <button onClick={download} className="border border-signal bg-signal px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink hover:bg-chalk">
                    download {selected.id}.lua ↓
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fog/55">
          <span>Try: <button onClick={() => { setQuery("730"); setOpen(true); }} className="text-fog-2 hover:text-signal">730</button> · <button onClick={() => { setQuery("ELDEN RING"); setOpen(true); }} className="text-fog-2 hover:text-signal">Elden Ring</button> · <button onClick={() => { setQuery("292030"); setOpen(true); }} className="text-fog-2 hover:text-signal">292030</button></span>
          <span>↑↓ choose · enter generate</span>
        </div>
      )}
    </div>
  );
}
