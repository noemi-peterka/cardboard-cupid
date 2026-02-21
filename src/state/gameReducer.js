// src/state/gameReducer.js
import { shuffle } from "../utils/shuffle";

export const initialState = {
  allGames: [],
  isLoading: true,
  error: null,

  ownedIds: new Set(),

  // "collection" -> pick games
  // "feed"       -> swipe through selected games and like some
  // "tournament" -> compare liked games until 1 winner
  // "result"     -> show winner
  mode: "collection",

  swipe: {
    // Feed phase
    feedDeck: [],
    feedIndex: 0,
    likedIds: new Set(),

    // Tournament phase (challenger style)
    tournamentDeck: [],
    tournamentIndex: 1, // starts at 1 because index 0 seeds currentWinner
    currentWinner: null,
  },

  winner: null,
};

function initTournamentFromLiked(state) {
  const likedGames = state.swipe.feedDeck.filter((g) =>
    state.swipe.likedIds.has(g.id),
  );

  // If they liked 0, fall back to random from owned feed deck
  if (likedGames.length === 0) {
    const fallback = state.swipe.feedDeck[0] ?? null;
    return { ...state, mode: "result", winner: fallback };
  }

  // If they liked exactly 1, that’s the winner
  if (likedGames.length === 1) {
    return { ...state, mode: "result", winner: likedGames[0] };
  }

  // Otherwise start tournament
  const tournamentDeck = shuffle(likedGames);
  const currentWinner = tournamentDeck[0];

  return {
    ...state,
    mode: "tournament",
    winner: null,
    swipe: {
      ...state.swipe,
      tournamentDeck,
      tournamentIndex: 1,
      currentWinner,
    },
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    // ---------------------------
    // Loading
    // ---------------------------
    case "LOAD_GAMES_START":
      return { ...state, isLoading: true, error: null };

    case "LOAD_GAMES_SUCCESS":
      return { ...state, isLoading: false, allGames: action.games };

    case "LOAD_GAMES_ERROR":
      return { ...state, isLoading: false, error: action.error };

    // ---------------------------
    // Collection selection
    // ---------------------------
    case "TOGGLE_OWNED": {
      const next = new Set(state.ownedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, ownedIds: next };
    }

    case "CLEAR_OWNED":
      return { ...state, ownedIds: new Set() };

    // ---------------------------
    // Start feed (Tinder swipe)
    // ---------------------------
    case "START_SWIPE": {
      const ownedGames = state.allGames.filter((g) => state.ownedIds.has(g.id));
      if (ownedGames.length === 0) return state;

      const feedDeck = shuffle(ownedGames);

      return {
        ...state,
        mode: "feed",
        winner: null,
        swipe: {
          feedDeck,
          feedIndex: 0,
          likedIds: new Set(),
          tournamentDeck: [],
          tournamentIndex: 1,
          currentWinner: null,
        },
      };
    }

    case "FEED_REJECT": {
      const nextIndex = state.swipe.feedIndex + 1;

      // finished feed -> init tournament from liked
      if (nextIndex >= state.swipe.feedDeck.length) {
        return initTournamentFromLiked({
          ...state,
          swipe: { ...state.swipe, feedIndex: nextIndex },
        });
      }

      return {
        ...state,
        swipe: { ...state.swipe, feedIndex: nextIndex },
      };
    }

    case "FEED_LIKE": {
      const current = state.swipe.feedDeck[state.swipe.feedIndex];
      const nextLiked = new Set(state.swipe.likedIds);
      if (current) nextLiked.add(current.id);

      const nextIndex = state.swipe.feedIndex + 1;

      // finished feed -> init tournament from liked
      if (nextIndex >= state.swipe.feedDeck.length) {
        return initTournamentFromLiked({
          ...state,
          swipe: { ...state.swipe, likedIds: nextLiked, feedIndex: nextIndex },
        });
      }

      return {
        ...state,
        swipe: { ...state.swipe, likedIds: nextLiked, feedIndex: nextIndex },
      };
    }

    // ---------------------------
    // Tournament (challenger rounds)
    // ---------------------------
    case "TOURNAMENT_KEEP_WINNER": {
      const { tournamentDeck, tournamentIndex, currentWinner } = state.swipe;
      const nextIndex = tournamentIndex + 1;

      // finished tournament
      if (tournamentIndex >= tournamentDeck.length - 1) {
        return { ...state, mode: "result", winner: currentWinner };
      }

      return {
        ...state,
        swipe: { ...state.swipe, tournamentIndex: nextIndex },
      };
    }

    case "TOURNAMENT_REPLACE_WINNER": {
      const { tournamentDeck, tournamentIndex } = state.swipe;
      const newWinner = tournamentDeck[tournamentIndex];
      const nextIndex = tournamentIndex + 1;

      // finished tournament after replacement
      if (tournamentIndex >= tournamentDeck.length - 1) {
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
          tournamentIndex: nextIndex,
        },
      };
    }

    // ---------------------------
    // Reset
    // ---------------------------
    case "RESET_SWIPE":
    case "RESET_TO_COLLECTION":
      return {
        ...state,
        mode: "collection",
        winner: null,
        swipe: {
          feedDeck: [],
          feedIndex: 0,
          likedIds: new Set(),
          tournamentDeck: [],
          tournamentIndex: 1,
          currentWinner: null,
        },
      };

    default:
      return state;
  }
}
