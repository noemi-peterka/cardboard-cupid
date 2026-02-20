import { useGame } from "../state/GameProvider";
import GameTile from "../components/GameTile";

export default function CollectionPage() {
  const { state, dispatch } = useGame();

  if (state.isLoading) return <p>Loading...</p>;
  if (state.error) return <p>Error: {state.error}</p>;

  const gamesToShow = state.allGames; // later filter via SearchBar

  return (
    <div>
      <div className="grid">
        {gamesToShow.map((g) => (
          <GameTile
            key={g.id}
            game={g}
            selected={state.ownedIds.has(g.id)}
            onClick={() => dispatch({ type: "TOGGLE_OWNED", id: g.id })}
          />
        ))}
      </div>

      <button
        disabled={state.ownedIds.size < 2}
        onClick={() => dispatch({ type: "START_SWIPE" })}
      >
        Start
      </button>
    </div>
  );
}
