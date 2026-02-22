import { gameImagesById } from "../data/gameImages";

export default function GameTile({ game, selected, onClick }) {
  const img = gameImagesById?.[game.id];

  return (
    <button
      className={`game-tile ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      {img && (
        <img className="game-tile__img" src={img} alt="" loading="lazy" />
      )}
      {img && <div className="game-tile__overlay" />}

      <div className="game-tile__content">
        <div className="game-name">{game.name}</div>
      </div>

      {selected && <div className="game-tile__check">✓</div>}
    </button>
  );
}
