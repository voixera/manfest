export type SteamGame = {
  id: number;
  name: string;
};

type RawSteamGame = {
  appid?: number;
  id?: number;
  name?: string;
};

// Complete Steam *games* database sources (updated daily)
// These are filtered to only actual games (no tools, servers, DLC, etc.)
const INDEX_SOURCES = [
  // Games-only list from IStoreService (filtered category: games)
  "https://cdn.jsdelivr.net/gh/jsnli/steamappidlist@master/data/games_appid.json",
  "https://raw.githubusercontent.com/jsnli/steamappidlist/master/data/games_appid.json",
  // Complete SteamCMD list (includes everything) — used as last resort
  "https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json",
];

export const FALLBACK_GAMES: SteamGame[] = [
  { id: 730, name: "Counter-Strike 2" },
  { id: 570, name: "Dota 2" },
  { id: 440, name: "Team Fortress 2" },
  { id: 620, name: "Portal 2" },
  { id: 550, name: "Left 4 Dead 2" },
  { id: 292030, name: "The Witcher 3: Wild Hunt" },
  { id: 1091500, name: "Cyberpunk 2077" },
  { id: 1245620, name: "ELDEN RING" },
  { id: 271590, name: "Grand Theft Auto V" },
  { id: 1174180, name: "Red Dead Redemption 2" },
  { id: 1086940, name: "Baldur's Gate 3" },
  { id: 413150, name: "Stardew Valley" },
  { id: 367520, name: "Hollow Knight" },
  { id: 105600, name: "Terraria" },
  { id: 578080, name: "PUBG: BATTLEGROUNDS" },
  { id: 252490, name: "Rust" },
  { id: 892970, name: "Valheim" },
  { id: 1966720, name: "Lethal Company" },
  { id: 1158310, name: "Crusader Kings III" },
  { id: 394360, name: "Hearts of Iron IV" },
  { id: 400, name: "Portal" },
  { id: 70, name: "Half-Life" },
  { id: 220, name: "Half-Life 2" },
  { id: 500, name: "Left 4 Dead" },
  { id: 240, name: "Counter-Strike: Source" },
];

let indexPromise: Promise<SteamGame[]> | null = null;

async function readResponse(
  response: Response,
  onProgress: (progress: number | null) => void,
) {
  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
    onProgress(total ? Math.min(received / total, 0.98) : null);
  }

  text += decoder.decode();
  return text;
}

function normalize(raw: unknown): SteamGame[] {
  // Handle multiple possible shapes from different mirrors
  let arr: RawSteamGame[] = [];

  if (Array.isArray(raw)) {
    arr = raw as RawSteamGame[];
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const apps = (obj as { apps?: unknown }).apps;
    const applistApps = (obj as { applist?: { apps?: unknown } }).applist?.apps;
    const responseApps = (obj as { response?: { apps?: unknown } }).response?.apps;
    if (Array.isArray(apps)) arr = apps as RawSteamGame[];
    else if (Array.isArray(applistApps)) arr = applistApps as RawSteamGame[];
    else if (Array.isArray(responseApps)) arr = responseApps as RawSteamGame[];
  }

  return arr
    .map((g) => ({ id: Number(g.appid ?? g.id), name: String(g.name ?? "") }))
    .filter((g) => Number.isInteger(g.id) && g.id > 0 && g.name.trim().length > 0);
}

export function loadSteamGames(onProgress: (progress: number | null) => void) {
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    let lastError: unknown;

    for (const source of INDEX_SOURCES) {
      try {
        const response = await fetch(source, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Index returned ${response.status}`);

        const text = await readResponse(response, onProgress);
        onProgress(0.99);

        const parsed = JSON.parse(text);
        const games = normalize(parsed);

        // Ensure we have real games (SteamCMD list has 200k+ entries, games-only mirrors have ~70k+)
        if (games.length < 30000) throw new Error("Index too small, likely incomplete");

        onProgress(1);
        return games;
      } catch (error) {
        lastError = error;
      }
    }

    indexPromise = null;
    throw lastError instanceof Error ? lastError : new Error("Steam index unavailable");
  })();

  return indexPromise;
}

export const steamHeader = (id: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;

export function findGames(games: SteamGame[], input: string, limit = 12) {
  const query = input.trim().toLocaleLowerCase();
  if (!query) return [];

  const results: SteamGame[] = [];
  const numeric = /^\d+$/.test(query);

  for (const game of games) {
    const match = numeric
      ? String(game.id).startsWith(query)
      : game.name.toLocaleLowerCase().includes(query);
    if (match) results.push(game);
    if (results.length >= limit) break;
  }

  return results;
}

export function buildLua(game: SteamGame) {
  const lines = [
    "-- VXLuaTools — Steam manifest starter",
    `-- App: ${game.name}`,
    `-- AppID: ${game.id}`,
    `-- Generated: ${new Date().toISOString()}`,
    "",
    `addappid(${game.id})`,
    "",
    "-- NOTE: Real depot keys + manifest IDs require an authorized Steam depot service.",
    "-- This file is a readable template only.",
  ];
  return lines.join("\n");
}
