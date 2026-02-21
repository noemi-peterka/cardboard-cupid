import { useRef, useState } from "react";
import { useGame } from "../state/GameProvider";

export default function SwipePage() {
  const img = gameImagesById[game.id];
  const { state, dispatch } = useGame();

  // drag/swipe support
  const startXRef = useRef(null);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const SWIPE_THRESHOLD = 90;

  function resetDrag() {
    setDx(0);
    setIsDragging(false);
    startXRef.current = null;
  }

  function handlePointerDown(e) {
    setIsDragging(true);
    startXRef.current = e.clientX;
  }

  function handlePointerMove(e) {
    if (!isDragging || startXRef.current == null) return;
    setDx(e.clientX - startXRef.current);
  }

  function handlePointerUp(onRight, onLeft) {
    if (!isDragging) return;

    if (dx > SWIPE_THRESHOLD) onRight();
    else if (dx < -SWIPE_THRESHOLD) onLeft();

    resetDrag();
  }

  // RESULT
  if (state.mode === "result") {
    return (
      <div className="swipe-page">
        <h2>Tonight’s pick:</h2>
        <h1>{state.winner?.name ?? "No winner"}</h1>

        <button type="button" onClick={() => dispatch({ type: "RESET_SWIPE" })}>
          Back to collection
        </button>
      </div>
    );
  }

  // FEED (one card, X/heart adds to liked)
  if (state.mode === "feed") {
    const { feedDeck, feedIndex, likedIds } = state.swipe;
    const current = feedDeck[feedIndex] ?? null;

    if (!current) {
      return (
        <div className="swipe-page">
          <p>No games to swipe.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_SWIPE" })}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <div className="swipe-page">
        <p className="swipe-progress">
          {Math.min(feedIndex + 1, feedDeck.length)} / {feedDeck.length} —{" "}
          {likedIds.size} liked
        </p>

        <div
          className="swipe-card"
          style={{
            transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
            transition: isDragging ? "none" : "transform 120ms ease-out",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() =>
            handlePointerUp(
              () => dispatch({ type: "FEED_LIKE" }),
              () => dispatch({ type: "FEED_REJECT" }),
            )
          }
          onPointerCancel={resetDrag}
        >
          <h1>{current.name}</h1>
          {current.year && <p className="swipe-meta">{current.year}</p>}
        </div>

        <div className="swipe-actions">
          <button
            type="button"
            className="swipe-btn swipe-btn-x"
            onClick={() => dispatch({ type: "FEED_REJECT" })}
            aria-label="Reject"
          >
            ✕
          </button>

          <button
            type="button"
            className="swipe-btn swipe-btn-heart"
            onClick={() => dispatch({ type: "FEED_LIKE" })}
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      </div>
    );
  }

  // TOURNAMENT (one card challenger, but winner is visible)
  if (state.mode === "tournament") {
    const { tournamentDeck, tournamentIndex, currentWinner } = state.swipe;
    const challenger = tournamentDeck[tournamentIndex] ?? null;

    if (!currentWinner || !challenger) {
      return (
        <div className="swipe-page">
          <p>Something went wrong starting the tournament.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_SWIPE" })}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <div className="swipe-page">
        <p className="swipe-progress">
          Round {tournamentIndex} / {tournamentDeck.length - 1}
        </p>

        <div className="tournament-winner">
          Current winner: <strong>{currentWinner.name}</strong>
        </div>

        <div
          className="swipe-card"
          style={{
            transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
            transition: isDragging ? "none" : "transform 120ms ease-out",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() =>
            handlePointerUp(
              // right: replace winner with challenger
              () => dispatch({ type: "TOURNAMENT_REPLACE_WINNER" }),
              // left: keep winner
              () => dispatch({ type: "TOURNAMENT_KEEP_WINNER" }),
            )
          }
          onPointerCancel={resetDrag}
        >
          <h1>{challenger.name}</h1>
          {challenger.year && <p className="swipe-meta">{challenger.year}</p>}
        </div>

        <div className="swipe-actions">
          <button
            type="button"
            className="swipe-btn swipe-btn-x"
            onClick={() => dispatch({ type: "TOURNAMENT_KEEP_WINNER" })}
            aria-label="Keep current winner"
            title="Keep current winner"
          >
            ✕
          </button>

          <button
            type="button"
            className="swipe-btn swipe-btn-heart"
            onClick={() => dispatch({ type: "TOURNAMENT_REPLACE_WINNER" })}
            aria-label="Replace winner"
            title="Replace winner"
          >
            ♥
          </button>
        </div>
      </div>
    );
  }

  // fallback
  return null;
}
