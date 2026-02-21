import fs from "node:fs";
import Papa from "papaparse";

const csv = fs.readFileSync("./data/boardgames_ranks.csv", "utf8");

const { data } = Papa.parse(csv, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
});

const genreCols = [
  ["abstracts_rank", "abstract"],
  ["cgs_rank", "customizable-card-game"],
  ["childrensgames_rank", "kids"],
  ["familygames_rank", "family"],
  ["partygames_rank", "party"],
  ["strategygames_rank", "strategy"],
  ["thematic_rank", "thematic"],
  ["wargames_rank", "wargame"],
];

// === TUNE THESE ===
const MIN_USERS_RATED = 500;
const MIN_YEAR = 1990;
const MAX_GAMES = 30000;
const DEDUPE_TITLES = true;
const DROP_PROMOS = true;
// ===================

let kept = 0;
let removedExpansions = 0;
let removedUnpopular = 0;
let removedOld = 0;
let removedPromos = 0;
let dedupedAway = 0;

function isExpansionFlag(val) {
  // handles 1, "1", true, "true"
  return val === 1 || val === "1" || val === true || val === "true";
}

function normalizeBaseTitle(name) {
  // "Codenames: Duet" -> "codenames"
  // "Azul (2017)" -> "azul"
  // "Codenames – Pictures" -> "codenames"
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[’']/g, "") // unify apostrophes
    .replace(/\s*\(.*?\)\s*/g, " ") // remove parenthetical
    .split(":")[0] // keep part before colon
    .split(" - ")[0] // keep part before dash
    .split(" – ")[0]
    .trim()
    .replace(/\s+/g, " ");
}

function looksLikePromo(name) {
  const n = String(name ?? "").toLowerCase();
  // lightweight heuristics; adjust if too aggressive
  return (
    n.includes("promo") ||
    n.includes("promotional") ||
    n.includes("demo") ||
    n.includes("scenario") ||
    n.includes("kit") ||
    n.includes("pack") ||
    n.includes("expansion") // extra safety even if mis-flagged
  );
}

const filtered = data
  .filter((g) => g && g.name)
  .filter((g) => {
    if (isExpansionFlag(g.is_expansion)) {
      removedExpansions++;
      return false;
    }
    return true;
  })
  .filter((g) => {
    if (DROP_PROMOS && looksLikePromo(g.name)) {
      removedPromos++;
      return false;
    }
    return true;
  })
  .filter((g) => {
    const ur = Number(g.usersrated ?? 0);
    if (!Number.isFinite(ur) || ur < MIN_USERS_RATED) {
      removedUnpopular++;
      return false;
    }
    return true;
  })
  .filter((g) => {
    const y = Number(g.yearpublished ?? 0);
    if (MIN_YEAR > 0 && Number.isFinite(y) && y > 0 && y < MIN_YEAR) {
      removedOld++;
      return false;
    }
    return true;
  });

// Deduplicate “variants” by base title
let deduped = filtered;
if (DEDUPE_TITLES) {
  const bestByTitle = new Map();

  for (const g of filtered) {
    const key = normalizeBaseTitle(g.name);
    const current = bestByTitle.get(key);

    if (!current) {
      bestByTitle.set(key, g);
      continue;
    }

    // keep the most “mainline” entry: highest usersrated, then highest bayes, then best rank
    const gUR = Number(g.usersrated ?? 0);
    const cUR = Number(current.usersrated ?? 0);

    const gBayes = Number(g.bayesaverage ?? 0);
    const cBayes = Number(current.bayesaverage ?? 0);

    const gRank = Number(g.rank ?? Number.POSITIVE_INFINITY);
    const cRank = Number(current.rank ?? Number.POSITIVE_INFINITY);

    const gIsBetter =
      gUR > cUR ||
      (gUR === cUR && gBayes > cBayes) ||
      (gUR === cUR && gBayes === cBayes && gRank < cRank);

    if (gIsBetter) bestByTitle.set(key, g);
    else dedupedAway++;
  }

  deduped = Array.from(bestByTitle.values());
}

const games = deduped
  .sort((a, b) => (b.usersrated ?? 0) - (a.usersrated ?? 0))
  .slice(0, MAX_GAMES)
  .map((g) => {
    const genres = genreCols
      .filter(([col]) => g[col] != null && Number.isFinite(g[col]))
      .map(([, label]) => label);

    kept++;

    return {
      id: Number(g.id),
      name: String(g.name),
      year: Number(g.yearpublished ?? 0) || null,
      rank: Number(g.rank ?? 0) || null,
      usersRated: Number(g.usersrated ?? 0) || 0,
      bayes: Number(g.bayesaverage ?? 0) || 0,
      avg: Number(g.average ?? 0) || 0,
      genres,
    };
  });

fs.mkdirSync("./public/data", { recursive: true });
fs.writeFileSync("./public/data/games.json", JSON.stringify(games));

console.log(
  `Wrote ${games.length} games to public/data/games.json\n` +
    `Removed expansions: ${removedExpansions}\n` +
    (DROP_PROMOS ? `Removed promo-ish: ${removedPromos}\n` : "") +
    `Removed unpopular (<${MIN_USERS_RATED} usersrated): ${removedUnpopular}\n` +
    (MIN_YEAR > 0 ? `Removed old (<${MIN_YEAR}): ${removedOld}\n` : "") +
    (DEDUPE_TITLES ? `Deduped away (same base title): ${dedupedAway}\n` : "") +
    `Kept: ${kept}`,
);
