import { useMemo, useState } from "react";
import { useGame } from "../state/GameProvider";
import SearchBar from "../components/SearchBar";
import GameTile from "../components/GameTile";

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}
export default function CollectionPage() {
  const { state, dispatch } = useGame();
  const [query, setQuery] = useState("");

  const visibleGames = useMemo(() => {
    if (!state.allGames.length) return [];

    const q = normalize(query);

    // 1) Default: top 20 rated (bayes, then usersRated)
    if (!q) {
      return [...state.allGames]
        .sort(
          (a, b) =>
            (b.bayes ?? 0) - (a.bayes ?? 0) ||
            (b.usersRated ?? 0) - (a.usersRated ?? 0),
        )
        .slice(0, 20);
    }

    // 2) Search mode: filter by name, then sort best matches
    // (simple contains match; you can improve later)
    return state.allGames
      .filter((g) => normalize(g.name).includes(q))
      .sort((a, b) => (b.usersRated ?? 0) - (a.usersRated ?? 0))
      .slice(0, 40); // cap results so UI stays fast
  }, [state.allGames, query]);

  if (state.isLoading) return <p>Loading...</p>;
  if (state.error) return <p>Error: {state.error}</p>;

  return (
    <div className="page">
      <SearchBar
        value={query}
        onChange={setQuery}
        onClear={() => setQuery("")}
      />

      <div className="grid">
        {visibleGames.map((game) => (
          <GameTile
            key={game.id}
            game={game}
            selected={state.ownedIds.has(game.id)}
            onClick={() => dispatch({ type: "TOGGLE_OWNED", id: game.id })}
          />
        ))}
      </div>
      <p>{state.ownedIds.size} selected</p>
      <div className="action-bar">
        <button
          className="btn"
          type="button"
          onClick={() => {
            dispatch({ type: "CLEAR_OWNED" });
            setQuery("");
          }}
          disabled={state.ownedIds.size === 0 && query === ""}
        >
          Clear all
        </button>

        <button
          className="btn"
          type="button"
          disabled={state.ownedIds.size < 2}
          onClick={() => dispatch({ type: "START_SWIPE" })}
        >
          Start
        </button>
      </div>
    </div>
  );
}
