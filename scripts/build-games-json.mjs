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

const MIN_USERS_RATED = 500;
const MIN_YEAR = 1990;
const MAX_GAMES = 30000;

let kept = 0;
let removedExpansions = 0;
let removedUnpopular = 0;
let removedOld = 0;

const games = data
  .filter((g) => g && g.name)
  .filter((g) => {
    if (g.is_expansion === 1) {
      removedExpansions++;
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
  })

  .sort((a, b) => (b.usersrated ?? 0) - (a.usersrated ?? 0))
  .slice(0, MAX_GAMES)
  .map((g) => {
    const genres = genreCols
      .filter(([col]) => g[col] != null && Number.isFinite(g[col]))
      .map(([, label]) => label);

    kept++;

    return {
      id: g.id,
      name: g.name,
      year: g.yearpublished,
      rank: g.rank,
      usersRated: g.usersrated,
      bayes: g.bayesaverage,
      avg: g.average,
      genres,
    };
  });

fs.mkdirSync("./public/data", { recursive: true });
fs.writeFileSync("./public/data/games.json", JSON.stringify(games));

console.log(
  `Wrote ${games.length} games to public/data/games.json\n` +
    `Removed expansions: ${removedExpansions}\n` +
    `Removed unpopular (<${MIN_USERS_RATED} usersrated): ${removedUnpopular}\n` +
    (MIN_YEAR > 0 ? `Removed old (<${MIN_YEAR}): ${removedOld}\n` : "") +
    `Kept: ${kept}`,
);
