import { parseDateRange } from "../../Functions/parseDateRange.js";

describe("parseDateRange", () => {
  test("returns an empty range when neither bound is present", () => {
    expect(parseDateRange({})).toEqual({});
  });

  test("parses valid startDate and endDate into real Date instances", () => {
    const result = parseDateRange({ startDate: "2026-01-01", endDate: "2026-01-31" });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.startDate.toISOString().slice(0, 10)).toBe("2026-01-01");
  });

  test("accepts an open-ended range (only startDate)", () => {
    const result = parseDateRange({ startDate: "2026-01-01" });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeUndefined();
  });

  test("returns null when startDate is not a valid date", () => {
    expect(parseDateRange({ startDate: "not-a-date" })).toBeNull();
  });

  test("returns null when endDate is not a valid date", () => {
    expect(parseDateRange({ startDate: "2026-01-01", endDate: "banana" })).toBeNull();
  });
});
