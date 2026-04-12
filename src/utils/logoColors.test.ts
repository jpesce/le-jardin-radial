import { describe, it, expect } from 'vitest';
import {
  isLight,
  colorsFromName,
  OUTER_PALETTE,
  INNER_PALETTE,
} from './logoColors';

describe('isLight', () => {
  it('returns true for white', () => {
    expect(isLight('#ffffff')).toBe(true);
  });

  it('returns false for black', () => {
    expect(isLight('#000000')).toBe(false);
  });

  it('returns true for yellow', () => {
    expect(isLight('#ffff00')).toBe(true);
  });

  it('returns false for navy', () => {
    expect(isLight('#000080')).toBe(false);
  });

  it('handles hex without hash', () => {
    expect(isLight('ffffff')).toBe(true);
    expect(isLight('000000')).toBe(false);
  });
});

describe('colorsFromName', () => {
  it('is deterministic', () => {
    const a = colorsFromName('Tainah Drummond');
    const b = colorsFromName('Tainah Drummond');
    expect(a).toEqual(b);
  });

  it('returns valid hex colors', () => {
    const { outer, inner } = colorsFromName('Test');
    expect(outer).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(inner).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('returns colors from the palettes', () => {
    const { outer, inner } = colorsFromName('Test');
    expect(OUTER_PALETTE).toContain(outer);
    expect(INNER_PALETTE).toContain(inner);
  });

  it('different names produce different colors', () => {
    const a = colorsFromName('Alice');
    const b = colorsFromName('Bob');
    expect(a.outer !== b.outer || a.inner !== b.inner).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(colorsFromName('test')).toEqual(colorsFromName('TEST'));
  });

  it('trims whitespace', () => {
    expect(colorsFromName('  test  ')).toEqual(colorsFromName('test'));
  });
});
