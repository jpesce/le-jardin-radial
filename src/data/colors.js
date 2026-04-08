const DEFAULT_STATE_COLORS = {
  dormant: '#8f967a',
  sprouting: '#9fbc8f',
  foliage: '#86a084',
  blooming: '#E84393',
};

export function resolveColor(state, flowerColors) {
  return flowerColors?.[state] ?? DEFAULT_STATE_COLORS[state] ?? '#cccccc';
}
