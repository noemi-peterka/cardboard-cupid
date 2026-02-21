// src/components/SearchBar.jsx
export default function SearchBar({ value = "", onChange, onClear }) {
  return (
    <div className="search-wrap">
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />

      {value.length > 0 && (
        <button
          type="button"
          className="search-clear"
          onClick={onClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
