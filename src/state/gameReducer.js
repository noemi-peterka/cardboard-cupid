import { shuffle } from "../utils/shuffle";

export const initialState = {
  allGames: [],
  isLoading: true,
  error: null,

  ownedIds: new Set(),

  mode: "collection",

  swipe: {
    candidates: [],
    currentIndex: 1,
    currentWinner: null,
  },

  winner: null,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case "LOAD_GAMES_START":
      return { ...state, isLoading: true, error: null };

    case "LOAD_GAMES_SUCCESS":
      return { ...state, isLoading: false, allGames: action.games };

    case "LOAD_GAMES_ERROR":
      return { ...state, isLoading: false, error: action.error };

    case "TOGGLE_OWNED": {
      const next = new Set(state.ownedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, ownedIds: next };
    }

    case "CLEAR_OWNED":
      return { ...state, ownedIds: new Set() };

    case "START_SWIPE": {
      const ownedGames = state.allGames.filter((g) => state.ownedIds.has(g.id));

      // guardrails
      if (ownedGames.length === 0) return state;
      if (ownedGames.length === 1) {
        return {
          ...state,
          mode: "result",
          winner: ownedGames[0],
          swipe: {
            candidates: [],
            currentIndex: 1,
            currentWinner: ownedGames[0],
          },
        };
      }

      const shuffled = shuffle(ownedGames);
      const currentWinner = shuffled[0];

      return {
        ...state,
        mode: "swipe",
        winner: null,
        swipe: {
          candidates: shuffled,
          currentIndex: 1,
          currentWinner,
        },
      };
    }

    case "KEEP_CURRENT": {
      const { candidates, currentIndex, currentWinner } = state.swipe;
      const nextIndex = currentIndex + 1;

      // finished
      if (currentIndex >= candidates.length - 1) {
        return { ...state, mode: "result", winner: currentWinner };
      }

      return {
        ...state,
        swipe: { ...state.swipe, currentIndex: nextIndex },
      };
    }

    case "REPLACE_CURRENT": {
      const { candidates, currentIndex } = state.swipe;
      const newWinner = candidates[currentIndex];
      const nextIndex = currentIndex + 1;

      // finished after replacement
      if (currentIndex >= candidates.length - 1) {
        return {
          ...state,
          mode: "result",
          winner: newWinner,
          swipe: { ...state.swipe, currentWinner: newWinner },
        };
      }

      return {
        ...state,
        swipe: {
          ...state.swipe,
          currentWinner: newWinner,
          currentIndex: nextIndex,
        },
      };
    }

    case "RESET_TO_COLLECTION":
      return {
        ...state,
        mode: "collection",
        winner: null,
        swipe: { candidates: [], currentIndex: 1, currentWinner: null },
      };

    default:
      return state;
  }
}
