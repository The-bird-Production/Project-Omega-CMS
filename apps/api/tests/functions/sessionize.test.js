import { sessionize, summarizeSessions } from "../../Functions/sessionize.js";

function at(minutesFromEpoch) {
  return new Date(minutesFromEpoch * 60 * 1000);
}

describe("sessionize", () => {
  test("groups consecutive views from the same visitor within 30 minutes into one session", () => {
    const events = [
      { visitorId: "a", date: at(0) },
      { visitorId: "a", date: at(10) },
      { visitorId: "a", date: at(25) },
    ];
    const sessions = sessionize(events);
    expect(sessions).toEqual([{ visitorId: "a", durationMs: 25 * 60 * 1000, pageViews: 3 }]);
  });

  test("starts a new session after a 30+ minute gap for the same visitor", () => {
    const events = [
      { visitorId: "a", date: at(0) },
      { visitorId: "a", date: at(5) },
      { visitorId: "a", date: at(40) },
    ];
    const sessions = sessionize(events);
    expect(sessions).toEqual([
      { visitorId: "a", durationMs: 5 * 60 * 1000, pageViews: 2 },
      { visitorId: "a", durationMs: 0, pageViews: 1 },
    ]);
  });

  test("a gap of exactly 30 minutes stays in the same session", () => {
    const events = [
      { visitorId: "a", date: at(0) },
      { visitorId: "a", date: at(30) },
    ];
    expect(sessionize(events)).toEqual([{ visitorId: "a", durationMs: 30 * 60 * 1000, pageViews: 2 }]);
  });

  test("never merges two different visitors into one session, even with no time gap", () => {
    const events = [
      { visitorId: "a", date: at(0) },
      { visitorId: "b", date: at(0) },
    ];
    const sessions = sessionize(events);
    expect(sessions).toEqual([
      { visitorId: "a", durationMs: 0, pageViews: 1 },
      { visitorId: "b", durationMs: 0, pageViews: 1 },
    ]);
  });

  test("a single page view is a session of duration 0", () => {
    expect(sessionize([{ visitorId: "a", date: at(0) }])).toEqual([
      { visitorId: "a", durationMs: 0, pageViews: 1 },
    ]);
  });

  test("returns an empty list for no events", () => {
    expect(sessionize([])).toEqual([]);
  });
});

describe("summarizeSessions", () => {
  test("averages duration and computes bounce rate (single-page-view sessions)", () => {
    const sessions = [
      { visitorId: "a", durationMs: 10 * 60 * 1000, pageViews: 3 }, // not a bounce
      { visitorId: "b", durationMs: 0, pageViews: 1 }, // bounce
      { visitorId: "c", durationMs: 0, pageViews: 1 }, // bounce
      { visitorId: "d", durationMs: 20 * 60 * 1000, pageViews: 2 }, // not a bounce
    ];
    const summary = summarizeSessions(sessions);
    expect(summary.averageDurationMs).toBe((10 * 60 * 1000 + 0 + 0 + 20 * 60 * 1000) / 4);
    expect(summary.bounceRate).toBe(50);
  });

  test("returns zeroes when there are no sessions", () => {
    expect(summarizeSessions([])).toEqual({ averageDurationMs: 0, bounceRate: 0 });
  });

  test("100% bounce rate when every session is a single page view", () => {
    const sessions = [
      { visitorId: "a", durationMs: 0, pageViews: 1 },
      { visitorId: "b", durationMs: 0, pageViews: 1 },
    ];
    expect(summarizeSessions(sessions).bounceRate).toBe(100);
  });
});
