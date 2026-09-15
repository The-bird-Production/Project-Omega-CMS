// Parses optional startDate/endDate query params into real Dates, or
// returns null if either is present but not a valid date — callers respond
// 400 in that case instead of silently querying with an "Invalid Date"
// (new Date("garbage") is a valid Date instance whose comparisons are
// always false, which previously made a typo'd date silently return zero
// rows rather than a clear error).
export function parseDateRange(query: Record<string, unknown>): { startDate?: Date; endDate?: Date } | null {
  const result: { startDate?: Date; endDate?: Date } = {};

  if (query.startDate !== undefined) {
    const parsed = new Date(query.startDate as string);
    if (isNaN(parsed.getTime())) return null;
    result.startDate = parsed;
  }

  if (query.endDate !== undefined) {
    const parsed = new Date(query.endDate as string);
    if (isNaN(parsed.getTime())) return null;
    result.endDate = parsed;
  }

  return result;
}
