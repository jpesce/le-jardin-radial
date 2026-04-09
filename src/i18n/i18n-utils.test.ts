import { describe, it, expect } from 'vitest';
import {
  resolveLangFromPath,
  get,
  interpolate,
  SUPPORTED,
  DEFAULT_LANG,
} from './i18n-utils';

describe('resolveLangFromPath', () => {
  it('returns browser lang for root path with no stored lang', () => {
    const result = resolveLangFromPath('/', null);
    expect(SUPPORTED).toContain(result);
  });

  it('returns fr for /fr', () => {
    expect(resolveLangFromPath('/fr', null)).toBe('fr');
  });

  it('returns en for /en', () => {
    expect(resolveLangFromPath('/en', null)).toBe('en');
  });

  it('returns browser lang for unsupported language', () => {
    const result = resolveLangFromPath('/de', null);
    expect(SUPPORTED).toContain(result);
  });

  it('returns browser lang for garbage path', () => {
    const result = resolveLangFromPath('/ksjahdfkjdhsaf', null);
    expect(SUPPORTED).toContain(result);
  });

  it('reads only the first path segment', () => {
    expect(resolveLangFromPath('/en/some/other/path', null)).toBe('en');
  });

  it('returns browser lang for empty string', () => {
    const result = resolveLangFromPath('', null);
    expect(SUPPORTED).toContain(result);
  });

  it('uses stored lang when path is root', () => {
    expect(resolveLangFromPath('/', 'en')).toBe('en');
  });

  it('uses stored lang for /share/ paths', () => {
    expect(resolveLangFromPath('/share/abc123', 'en')).toBe('en');
  });

  it('URL lang overrides stored lang', () => {
    expect(resolveLangFromPath('/fr', 'en')).toBe('fr');
  });

  it('ignores invalid stored lang', () => {
    const result = resolveLangFromPath('/', 'de');
    expect(SUPPORTED).toContain(result);
  });
});

describe('get', () => {
  const obj: Record<string, unknown> = {
    simple: 'hello',
    nested: { deep: { value: 'found' } },
    array: [1, 2, 3],
    seasons: { spring: { name: 'printemps', range: 'mar \u2013 mai' } },
  };

  it('retrieves a top-level key', () => {
    expect(get(obj, 'simple')).toBe('hello');
  });

  it('retrieves a nested key with dot notation', () => {
    expect(get(obj, 'nested.deep.value')).toBe('found');
  });

  it('retrieves nested objects', () => {
    expect(get(obj, 'seasons.spring')).toEqual({
      name: 'printemps',
      range: 'mar \u2013 mai',
    });
  });

  it('returns an array value', () => {
    expect(get(obj, 'array')).toEqual([1, 2, 3]);
  });

  it('returns undefined for missing key', () => {
    expect(get(obj, 'missing')).toBeUndefined();
  });

  it('returns undefined for missing nested key', () => {
    expect(get(obj, 'nested.missing.deep')).toBeUndefined();
  });

  it('returns undefined for path through non-object', () => {
    expect(get(obj, 'simple.foo')).toBeUndefined();
  });
});

describe('interpolate', () => {
  it('replaces a single variable', () => {
    expect(interpolate('hello {name}', { name: 'world' })).toBe('hello world');
  });

  it('replaces multiple variables', () => {
    expect(interpolate('{a} and {b}', { a: 'one', b: 'two' })).toBe(
      'one and two',
    );
  });

  it('keeps placeholder for missing variable', () => {
    expect(interpolate('hello {name}', {})).toBe('hello {name}');
  });

  it('returns string unchanged when no vars provided', () => {
    expect(interpolate('hello world')).toBe('hello world');
  });

  it('returns string unchanged when vars is undefined', () => {
    expect(interpolate('hello {name}', undefined)).toBe('hello {name}');
  });

  it('returns non-string values as-is', () => {
    const arr = ['jan', 'feb'];
    expect(interpolate(arr, { foo: 'bar' })).toBe(arr);
  });

  it('returns number as-is', () => {
    expect(interpolate(42, { x: 'y' })).toBe(42);
  });
});

describe('constants', () => {
  it('SUPPORTED includes fr and en', () => {
    expect(SUPPORTED).toEqual(['fr', 'en']);
  });

  it('DEFAULT_LANG is fr', () => {
    expect(DEFAULT_LANG).toBe('fr');
  });
});
