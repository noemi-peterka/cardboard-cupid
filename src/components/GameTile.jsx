export default function GameTile({ game, selected, onClick }) {
  return (
    <button
      className={`game-tile ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="game-name">{game.name}</div>

      <div className="game-rating">★ {game.avg?.toFixed(1)}</div>

      {selected && <div className="checkmark">✓</div>}
    </button>
  );
}
