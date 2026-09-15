// Groups a visitor's ordered page-view timestamps into sessions using the
// standard analytics convention: a gap of 30+ minutes between two
// consecutive views from the same visitor starts a new session. There's no
// stored "session" concept — this is computed on demand from stats_web
// rows, which is why callers must pass rows already sorted by
// (visitorId, date) ascending.

const SESSION_GAP_MS = 30 * 60 * 1000;

export interface VisitorEvent {
  visitorId: string;
  date: Date;
}

export interface Session {
  visitorId: string;
  durationMs: number;
  pageViews: number;
}

export function sessionize(events: VisitorEvent[]): Session[] {
  const sessions: Session[] = [];
  let current: { visitorId: string; start: Date; end: Date; pageViews: number } | null = null;

  for (const event of events) {
    if (
      current &&
      current.visitorId === event.visitorId &&
      event.date.getTime() - current.end.getTime() <= SESSION_GAP_MS
    ) {
      current.end = event.date;
      current.pageViews += 1;
      continue;
    }

    if (current) {
      sessions.push({
        visitorId: current.visitorId,
        durationMs: current.end.getTime() - current.start.getTime(),
        pageViews: current.pageViews,
      });
    }
    current = { visitorId: event.visitorId, start: event.date, end: event.date, pageViews: 1 };
  }

  if (current) {
    sessions.push({
      visitorId: current.visitorId,
      durationMs: current.end.getTime() - current.start.getTime(),
      pageViews: current.pageViews,
    });
  }

  return sessions;
}

export function summarizeSessions(sessions: Session[]): { averageDurationMs: number; bounceRate: number } {
  if (sessions.length === 0) return { averageDurationMs: 0, bounceRate: 0 };

  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const bounces = sessions.filter((s) => s.pageViews === 1).length;

  return {
    averageDurationMs: totalDuration / sessions.length,
    bounceRate: (bounces / sessions.length) * 100,
  };
}
