import { describe, it, expect } from 'vitest';
import {
  resolveColor,
  DEFAULT_STATE_COLORS,
  DEFAULT_BLOOM_COLOR,
} from './colors';

describe('resolveColor', () => {
  it('returns default color when no flower colors provided', () => {
    expect(resolveColor('dormant')).toBe(DEFAULT_STATE_COLORS.dormant);
    expect(resolveColor('sprouting')).toBe(DEFAULT_STATE_COLORS.sprouting);
    expect(resolveColor('foliage')).toBe(DEFAULT_STATE_COLORS.foliage);
    expect(resolveColor('blooming')).toBe(DEFAULT_STATE_COLORS.blooming);
  });

  it('returns flower-specific color when provided', () => {
    expect(resolveColor('blooming', { blooming: '#FF0000' })).toBe('#FF0000');
  });

  it('falls back to default for states not in flower colors', () => {
    expect(resolveColor('dormant', { blooming: '#FF0000' })).toBe(
      DEFAULT_STATE_COLORS.dormant,
    );
  });

  it('returns default bloom color for blooming state', () => {
    expect(resolveColor('blooming')).toBe(DEFAULT_BLOOM_COLOR);
  });
});
