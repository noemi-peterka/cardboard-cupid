// src/state/GameProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { gameReducer, initialState } from "./gameReducer";
import { loadOwnedIds, saveOwnedIds } from "../utils/storage";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load games once
  useEffect(() => {
    const load = async () => {
      dispatch({ type: "LOAD_GAMES_START" });
      try {
        // start with sampleData.json; later swap to /games.json
        const res = await fetch("/sampleData.json");
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        const games = await res.json();

        // make sure IDs are numbers (sometimes JSON/csv can be strings)
        const normalized = games.map((g) => ({ ...g, id: Number(g.id) }));

        dispatch({ type: "LOAD_GAMES_SUCCESS", games: normalized });
      } catch (err) {
        dispatch({
          type: "LOAD_GAMES_ERROR",
          error: err.message || String(err),
        });
      }
    };

    load();
  }, []);

  // Hydrate owned IDs from localStorage once games exist (or immediately)
  useEffect(() => {
    const ids = loadOwnedIds(); // returns number[]
    if (ids.length) {
      // hydrate by dispatching toggle for each id (simple + reducer-driven)
      ids.forEach((id) => dispatch({ type: "TOGGLE_OWNED", id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist ownedIds on change
  useEffect(() => {
    saveOwnedIds(Array.from(state.ownedIds));
  }, [state.ownedIds]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
