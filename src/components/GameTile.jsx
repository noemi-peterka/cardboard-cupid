export default function GameTile({ game, selected, onClick }) {
  const img = gameImagesById[game.id];
  return (
    <button
      {...(img && (
        <img className="game-tile__img" src={img} alt="" loading="lazy" />
      ))}
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
