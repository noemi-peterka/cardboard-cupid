# Cardboard Cupid 🎲💘

Cardboard Cupid is a React app that helps you pick a board game to play using a Tinder-style flow.

You start by selecting games from a curated library (generated from a CSV dataset), then swipe through a deck to build a shortlist. Once you’re done swiping, the app runs a “final round” tournament to crown a single winner — with a small confetti celebration at the end.

## Features

- **Game library from local data** (no API required)
- **Search + select** games you own / want to consider
- **Top games shown by default** (so the screen isn’t empty)
- **Swipe deck (feed round)**:
  - ✕ reject
  - ♥ like
  - drag left/right support (pointer events)
- **Tournament round** to produce **one final winner**
- **Winner screen** with **confetti**
- Optional **local cover images** per game (drop files into `/public/images/games`)

## Tech Stack

- React (Vite)
- Context + reducer for app state
- Local JSON dataset generated from CSV
- `canvas-confetti` for the winner animation

## App Flow

1. **Collection page**
   - Browse + search the game list
   - Select games to include in your session
   - Start is enabled once at least 2 games are selected

2. **Swipe feed**
   - Swipe/choose games to “like”
   - Builds a shortlist

3. **Tournament**
   - Compares liked games to produce one final winner

4. **Result**
   - Displays the winner + confetti

## Data: CSV → JSON

The original dataset is a CSV file (`boardgames_ranks.csv`). A Node script parses it and creates a smaller, cleaner JSON file used by the React app.

Filtering rules typically include:

- Remove expansions / variants
- Remove very unpopular games
- Remove very old games (optional)
- Deduplicate near-identical names

### Build the JSON

From the project root:

```bash
node scripts/build-games-json.mjs
```
