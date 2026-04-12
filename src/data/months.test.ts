import { describe, it, expect } from 'vitest';
import {
  parseMonths,
  compactMonths,
  bloomRanges,
  firstBloomStart,
} from './months';
import type { FlowerState, MonthsConfig } from '../types';

const states = (obj: MonthsConfig) => parseMonths(obj);

describe('bloomRanges', () => {
  it('normal range', () => {
    expect(
      bloomRanges(
        states({ '1-4': 'dormant', '5-10': 'blooming', '11-12': 'dormant' }),
      ),
    ).toEqual([{ start: 4, end: 9 }]);
  });

  it('wrap-around merges into single range', () => {
    expect(
      bloomRanges(
        states({ '1-3': 'blooming', '4-11': 'dormant', 12: 'blooming' }),
      ),
    ).toEqual([{ start: 11, end: 2 }]);
  });

  it('multiple separate ranges', () => {
    expect(
      bloomRanges(
        states({
          '1-2': 'dormant',
          '3-5': 'blooming',
          '6-8': 'dormant',
          '9-11': 'blooming',
          12: 'dormant',
        }),
      ),
    ).toEqual([
      { start: 2, end: 4 },
      { start: 8, end: 10 },
    ]);
  });

  it('single month', () => {
    expect(
      bloomRanges(
        states({ '1-5': 'dormant', 6: 'blooming', '7-12': 'dormant' }),
      ),
    ).toEqual([{ start: 5, end: 5 }]);
  });

  it('all year blooming', () => {
    expect(bloomRanges(states({ '1-12': 'blooming' }))).toEqual([
      { start: 0, end: 11 },
    ]);
  });

  it('no blooming', () => {
    expect(bloomRanges(states({ '1-12': 'dormant' }))).toEqual([]);
  });

  it('wrap-around with multiple ranges', () => {
    expect(
      bloomRanges(
        states({
          '1-2': 'blooming',
          '3-5': 'dormant',
          '6-8': 'blooming',
          '9-11': 'dormant',
          12: 'blooming',
        }),
      ),
    ).toEqual([
      { start: 5, end: 7 },
      { start: 11, end: 1 },
    ]);
  });

  it('single month wrap-around', () => {
    expect(
      bloomRanges(states({ 1: 'dormant', '2-11': 'dormant', 12: 'blooming' })),
    ).toEqual([{ start: 11, end: 11 }]);
  });

  it('two single months', () => {
    expect(
      bloomRanges(
        states({
          1: 'blooming',
          '2-5': 'dormant',
          6: 'blooming',
          '7-12': 'dormant',
        }),
      ),
    ).toEqual([
      { start: 5, end: 5 },
      { start: 0, end: 0 },
    ]);
  });
});

describe('firstBloomStart', () => {
  it('normal range returns first month', () => {
    expect(
      firstBloomStart(
        states({ '1-4': 'dormant', '5-10': 'blooming', '11-12': 'dormant' }),
      ),
    ).toBe(4);
  });

  it('wrap-around returns start of wrapped range', () => {
    expect(
      firstBloomStart(
        states({ '1-3': 'blooming', '4-11': 'dormant', 12: 'blooming' }),
      ),
    ).toBe(11);
  });

  it('all year returns 0', () => {
    expect(firstBloomStart(states({ '1-12': 'blooming' }))).toBe(0);
  });

  it('no blooming returns 12', () => {
    expect(firstBloomStart(states({ '1-12': 'dormant' }))).toBe(12);
  });
});

describe('compactMonths', () => {
  it('compresses all-same states into a single range', () => {
    expect(compactMonths(Array<FlowerState>(12).fill('dormant'))).toEqual({
      '1-12': 'dormant',
    });
  });

  it('keeps single months as individual keys', () => {
    expect(
      compactMonths([
        'blooming',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
        'dormant',
      ]),
    ).toEqual({ '1': 'blooming', '2-12': 'dormant' });
  });

  it('handles alternating states', () => {
    expect(
      compactMonths([
        'dormant',
        'sprouting',
        'foliage',
        'blooming',
        'blooming',
        'blooming',
        'foliage',
        'foliage',
        'sprouting',
        'dormant',
        'dormant',
        'dormant',
      ]),
    ).toEqual({
      '1': 'dormant',
      '2': 'sprouting',
      '3': 'foliage',
      '4-6': 'blooming',
      '7-8': 'foliage',
      '9': 'sprouting',
      '10-12': 'dormant',
    });
  });

  it('round-trips with parseMonths', () => {
    const original = {
      '1-3': 'dormant' as const,
      '4-6': 'blooming' as const,
      '7-9': 'foliage' as const,
      '10-12': 'sprouting' as const,
    };
    expect(compactMonths(parseMonths(original))).toEqual(original);
  });
});
