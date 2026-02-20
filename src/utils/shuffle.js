export function shuffle(array) {
  // Make a shallow copy so we don't mutate original
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    // random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // swap
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
