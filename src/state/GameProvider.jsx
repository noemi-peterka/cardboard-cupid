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

  useEffect(() => {
    const load = async () => {
      dispatch({ type: "LOAD_GAMES_START" });
      try {
        const res = await fetch("/sampleData.json");
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        const games = await res.json();

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

  useEffect(() => {
    const ids = loadOwnedIds();
    if (ids.length) {
      ids.forEach((id) => dispatch({ type: "TOGGLE_OWNED", id }));
    }
  }, []);

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
