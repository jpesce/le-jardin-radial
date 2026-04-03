export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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
