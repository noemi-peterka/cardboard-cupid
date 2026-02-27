import { useRef, useState, useEffect } from "react";
import { useGame } from "../state/GameProvider";
import confetti from "canvas-confetti";

export default function SwipePage() {
  const { state, dispatch } = useGame();

  const startXRef = useRef(null);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const SWIPE_THRESHOLD = 90;

  // ✅ Hook must be at top-level (not inside if)
  useEffect(() => {
    if (state.mode !== "result") return;
    const winner = state.winner;
    if (!winner) return;

    const duration = 900;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 60,
        spread: 70,
        startVelocity: 35,
        origin: { y: 0.25 },
      });
      confetti({
        particleCount: 40,
        spread: 90,
        startVelocity: 30,
        origin: { y: 0.25 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [state.mode, state.winner?.id]);

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

    if (dx > SWIPE_THRESHOLD) {
      onRight();
    } else if (dx < -SWIPE_THRESHOLD) {
      onLeft();
    }

    resetDrag();
  }

  // ===============================
  // RESULT MODE
  // ===============================
  if (state.mode === "result") {
    const winner = state.winner;

    return (
      <div className="swipe-page">
        <h2>Tonight’s pick</h2>

        {winner ? (
          <div className="swipe-card result-card">
            <img
              className="swipe-card__img"
              src={`/images/games/${winner.id}.jpg`}
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="swipe-card__overlay" />

            <h1>{winner.name}</h1>
            {winner.year && <p className="swipe-meta">{winner.year}</p>}
          </div>
        ) : (
          <p>No winner.</p>
        )}

        <button
          className="btn"
          onClick={() => dispatch({ type: "RESET_SWIPE" })}
        >
          Back to collection
        </button>
      </div>
    );
  }

  // ===============================
  // FEED MODE
  // ===============================
  if (state.mode === "feed") {
    const { feedDeck, feedIndex, likedIds } = state.swipe;
    const current = feedDeck[feedIndex];

    if (!current) {
      return (
        <div className="swipe-page">
          <p>No games to swipe.</p>
          <button
            className="btn"
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
          {feedIndex + 1} / {feedDeck.length} — {likedIds.size} liked
        </p>

        <div
          className="swipe-card"
          style={{
            transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
            transition: isDragging ? "none" : "transform 150ms ease",
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
          <img
            className="swipe-card__img"
            src={`/images/games/${current.id}.jpg`}
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="swipe-card__overlay" />

          <h1>{current.name}</h1>
          {current.year && <p className="swipe-meta">{current.year}</p>}
        </div>

        <div className="swipe-actions">
          <button
            className="swipe-btn swipe-btn-x"
            onClick={() => dispatch({ type: "FEED_REJECT" })}
          >
            ✕
          </button>
          <button
            className="swipe-btn swipe-btn-heart"
            onClick={() => dispatch({ type: "FEED_LIKE" })}
          >
            ♥
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // TOURNAMENT MODE
  // ===============================
  if (state.mode === "tournament") {
    const { tournamentDeck, tournamentIndex, currentWinner } = state.swipe;
    const challenger = tournamentDeck[tournamentIndex];

    if (!currentWinner || !challenger) {
      return (
        <div className="swipe-page">
          <p>Something went wrong.</p>
          <button
            className="btn"
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
            transition: isDragging ? "none" : "transform 150ms ease",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() =>
            handlePointerUp(
              () => dispatch({ type: "TOURNAMENT_REPLACE_WINNER" }),
              () => dispatch({ type: "TOURNAMENT_KEEP_WINNER" }),
            )
          }
          onPointerCancel={resetDrag}
        >
          <img
            className="swipe-card__img"
            src={`/images/games/${challenger.id}.jpg`}
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="swipe-card__overlay" />

          <h1>{challenger.name}</h1>
          {challenger.year && <p className="swipe-meta">{challenger.year}</p>}
        </div>

        <div className="swipe-actions">
          <button
            className="swipe-btn swipe-btn-x"
            onClick={() => dispatch({ type: "TOURNAMENT_KEEP_WINNER" })}
          >
            ✕
          </button>
          <button
            className="swipe-btn swipe-btn-heart"
            onClick={() => dispatch({ type: "TOURNAMENT_REPLACE_WINNER" })}
          >
            ♥
          </button>
        </div>
      </div>
    );
  }

  return null;
}
