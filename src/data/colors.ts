import type { FlowerState } from '../types';

export const DEFAULT_BLOOM_COLOR = '#E84393';

export const DEFAULT_STATE_COLORS: Record<FlowerState, string> = {
  dormant: '#8f967a',
  sprouting: '#9fbc8f',
  foliage: '#86a084',
  blooming: DEFAULT_BLOOM_COLOR,
};

export function resolveColor(
  state: FlowerState,
  flowerColors?: Partial<Record<FlowerState, string>>,
): string {
  return flowerColors?.[state] ?? DEFAULT_STATE_COLORS[state];
}
