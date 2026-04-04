const DEFAULT_STATE_COLORS = {
  dormant: "#8B7355",
  sprouting: "#90EE90",
  foliage: "#228B22",
  blooming: "#E84393",
};

export function resolveColor(state, flowerColors) {
  return flowerColors?.[state] ?? DEFAULT_STATE_COLORS[state] ?? "#cccccc";
}
