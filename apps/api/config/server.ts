// Moved to lib/serverConfig.ts (see that file for why) — kept as a
// re-export for code that still imports config/server.js. Nothing in the
// app itself imports this file anymore, so an outdated copy persisted by
// an old install can't override the real settings.
export * from "../lib/serverConfig.js";
