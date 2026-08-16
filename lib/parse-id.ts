/**
 * Parses a route-param id into a strictly positive integer.
 * `Number()` (not `parseInt`) so `"1.5"`/`"1abc"`/`""` are rejected,
 * not silently truncated — guards against junk cache keys and 404s.
 */
export function parsePositiveInt(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
