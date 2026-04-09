import { describe, it, expect } from 'vitest';
import { sanitize } from './updateMeta';

describe('sanitize', () => {
  it('passes through normal text', () => {
    expect(sanitize('Tainah Drummond')).toBe('Tainah Drummond');
  });

  it('passes through accented characters', () => {
    expect(sanitize('Jos\u00e9 Garc\u00eda')).toBe('Jos\u00e9 Garc\u00eda');
  });

  it('strips angle brackets', () => {
    expect(sanitize('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('strips quotes and ampersand', () => {
    expect(sanitize('Tom & "Jerry"')).toBe('Tom  Jerry');
  });

  it('strips single quotes', () => {
    expect(sanitize("O'Brien")).toBe('OBrien');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });
});
