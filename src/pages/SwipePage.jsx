import { useMemo, useRef, useState } from "react";
import { useGame } from "../state/GameProvider";

export default function SwipePage() {
  const { state, dispatch } = useGame();
  const { candidates, currentIndex, currentWinner } = state.swipe;

  // In challenger-mode, the "card" we show is the challenger.
  const challenger = candidates[currentIndex] ?? null;

  // drag/swipe
  const startXRef = useRef(null);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalChallengers = useMemo(() => {
    // challengers are everyone after the first item (winner seed)
    return Math.max(0, (candidates?.length ?? 0) - 1);
  }, [candidates]);

  const currentStep = useMemo(() => {
    // currentIndex starts at 1 in your reducer
    if (!candidates?.length) return 0;
    return Math.max(0, currentIndex);
  }, [candidates, currentIndex]);

  // If we have no winner, user hasn't started properly
  if (!currentWinner) {
    return (
      <div className="swipe-page">
        <p>No games selected.</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_TO_COLLECTION" })}
        >
          Back
        </button>
      </div>
    );
  }

  // Result mode (your reducer sets mode === "result" when finished)
  if (state.mode === "result") {
    const winner = state.winner ?? currentWinner;
    return (
      <div className="swipe-page">
        <h2>Tonight’s pick:</h2>
        <h1>{winner.name}</h1>

        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_TO_COLLECTION" })}
        >
          Pick again
        </button>
      </div>
    );
  }

  // Safety: if challenger is missing but mode isn't result, show fallback
  if (!challenger) {
    return (
      <div className="swipe-page">
        <p>All done.</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_TO_COLLECTION" })}
        >
          Back
        </button>
      </div>
    );
  }

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

  function handlePointerUp() {
    if (!isDragging) return;

    if (dx > SWIPE_THRESHOLD) {
      // Heart/right: accept challenger (becomes new winner)
      dispatch({ type: "REPLACE_CURRENT" });
    } else if (dx < -SWIPE_THRESHOLD) {
      // X/left: reject challenger (keep winner)
      dispatch({ type: "KEEP_CURRENT" });
    }

    resetDrag();
  }

  return (
    <div className="swipe-page">
      <p className="swipe-progress">
        {currentStep} / {totalChallengers}
      </p>

      {/* Show ONE card: the challenger */}
      <div
        className="swipe-card"
        style={{
          transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
          transition: isDragging ? "none" : "transform 120ms ease-out",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetDrag}
      >
        <h1>{challenger.name}</h1>
        {challenger.year && <p className="swipe-meta">{challenger.year}</p>}
      </div>

      <div className="swipe-actions">
        <button
          type="button"
          className="swipe-btn swipe-btn-x"
          onClick={() => dispatch({ type: "KEEP_CURRENT" })}
          aria-label="Reject"
        >
          ✕
        </button>

        <button
          type="button"
          className="swipe-btn swipe-btn-heart"
          onClick={() => dispatch({ type: "REPLACE_CURRENT" })}
          aria-label="Accept"
        >
          ♥
        </button>
      </div>

      {/* Optional: tiny hint of what’s “winning” without showing two cards */}
      <p className="swipe-hint">
        Current winner: <strong>{currentWinner.name}</strong>
      </p>
    </div>
  );
}
