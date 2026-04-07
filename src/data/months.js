export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SHORT_MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/**
 * Returns bloom ranges as an array of { start, end } month indices (0–11),
 * handling wrap-around. Shared by bloomRange and firstBloomStart.
 */
function getBloomRanges(monthStates) {
  const blooming = monthStates.map((s) => s === "blooming");
  const offset = blooming.indexOf(false);
  if (offset === -1) return [{ start: 0, end: 11 }];
  if (!blooming.includes(true)) return [];

  const ranges = [];
  let start = null;

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

/**
 * Returns the month index (0–11) where the first bloom range starts,
 * handling wrap-around. Returns 12 if no blooming.
 */
export function firstBloomStart(monthStates) {
  const ranges = getBloomRanges(monthStates);
  return ranges.length > 0 ? ranges[0].start : 12;
}

/**
 * Returns a string like "may–oct" or "dec–mar" for blooming months.
 */
export function bloomRange(monthStates) {
  const ranges = getBloomRanges(monthStates);
  if (ranges.length === 0) return "";
  return ranges
    .map(({ start, end }) =>
      start === end
        ? SHORT_MONTHS[start]
        : `${SHORT_MONTHS[start]}–${SHORT_MONTHS[end]}`,
    )
    .join(", ");
}

/**
 * Parse a months object with range keys into a 12-element array.
 *
 * Accepts keys like "1", "3-5", "10-12". Month numbers are 1-based.
 * Returns an array where index 0 = January, index 11 = December.
 */
export function parseMonths(monthsObj) {
  const result = new Array(12).fill("dormant");

  for (const [key, state] of Object.entries(monthsObj)) {
    if (key.includes("-")) {
      const [start, end] = key.split("-").map(Number);
      for (let m = start; m <= end; m++) {
        result[m - 1] = state;
      }
    } else {
      result[Number(key) - 1] = state;
    }
  }

  return result;
}
