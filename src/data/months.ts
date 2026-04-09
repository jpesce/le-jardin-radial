import type {
  FlowerState,
  MonthsConfig,
  MonthStates,
  BloomRange,
} from '../types';

export function bloomRanges(monthStates: MonthStates): BloomRange[] {
  const blooming = monthStates.map((s) => s === 'blooming');
  const offset = blooming.indexOf(false);
  if (offset === -1) return [{ start: 0, end: 11 }];
  if (!blooming.includes(true)) return [];

  const ranges: BloomRange[] = [];
  let start: number | null = null;

  for (let step = 0; step < 12; step++) {
    const i = (offset + step) % 12;
    if (blooming[i]) {
      if (start === null) start = i;
    } else if (start !== null) {
      ranges.push({ start, end: (offset + step - 1) % 12 });
      start = null;
    }
  }
  if (start !== null) {
    ranges.push({ start, end: (offset + 11) % 12 });
  }

  return ranges;
}

export function firstBloomStart(monthStates: MonthStates): number {
  const ranges = bloomRanges(monthStates);
  return ranges.length > 0 ? (ranges[0]?.start ?? 12) : 12;
}

export function parseMonths(monthsObj: MonthsConfig): MonthStates {
  const result: FlowerState[] = new Array<FlowerState>(12).fill('dormant');

  for (const [key, state] of Object.entries(monthsObj)) {
    if (key.includes('-')) {
      const parts = key.split('-').map(Number);
      const start = parts[0] ?? 0;
      const end = parts[1] ?? 0;
      for (let m = start; m <= end; m++) {
        result[m - 1] = state;
      }
    } else {
      result[Number(key) - 1] = state;
    }
  }

  return result;
}
