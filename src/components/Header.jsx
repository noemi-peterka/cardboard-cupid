// src/components/Header.jsx
import { useGame } from "../state/GameProvider";

export default function Header() {
  const { state, dispatch } = useGame();

  const selectedCount = state.ownedIds?.size ?? 0;
  const inCollection = state.mode === "collection";
  const inSwipe = state.mode === "feed" || state.mode === "tournament";
  const inResult = state.mode === "result";

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-logo" aria-hidden="true">
          <span className="pip" />
          <span className="pip" />
          <span className="pip" />
          <span className="pip" />
          <span className="pip" />
        </div>

        <div className="app-title">
          <h1>Cardboard Cupid</h1>
          <p>Swipe a shortlist, crown a winner.</p>
        </div>
      </div>

      <div className="app-header__right">
        {inCollection && (
          <>
            <span className="badge">
              Selected <strong>{selectedCount}</strong>
            </span>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => dispatch({ type: "CLEAR_OWNED" })}
              disabled={selectedCount === 0}
            >
              Clear
            </button>

            <button
              type="button"
              className="btn btn--primary"
              onClick={() => dispatch({ type: "START_SWIPE" })}
              disabled={selectedCount < 2}
              title={
                selectedCount < 2 ? "Select at least 2 games" : "Start swiping"
              }
            >
              Start
            </button>
          </>
        )}

        {(inSwipe || inResult) && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => dispatch({ type: "RESET_SWIPE" })}
          >
            Back
          </button>
        )}
      </div>
    </header>
  );
}
