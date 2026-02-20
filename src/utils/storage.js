// src/utils/storage.js
const KEY = "cardboard_cupid_owned_ids";

export function loadOwnedIds() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(Number).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

export function saveOwnedIds(idsArray) {
  try {
    localStorage.setItem(KEY, JSON.stringify(idsArray));
  } catch {
    // ignore storage errors
  }
}
