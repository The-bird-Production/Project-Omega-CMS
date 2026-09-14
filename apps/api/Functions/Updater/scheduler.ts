import cron from "node-cron";
import { prisma } from "@omega/db";
import { checkForUpdate } from "./checkForUpdate.js";
import { applyUpdate } from "./applyUpdate.js";

// Every 6 hours by default; override with UPDATE_CHECK_CRON if you want a
// different cadence. Checking is always safe (read-only, just talks to the
// GitHub API) — only *applying* an update is gated behind the
// AppSettings.autoUpdateEnabled flag, which defaults to false, so nothing
// self-modifies unless an admin explicitly opts in.
const CRON_EXPRESSION = process.env.UPDATE_CHECK_CRON || "0 */6 * * *";

export function startUpdateScheduler() {
  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      try {
        const status = await checkForUpdate();

        if (!status.updateAvailable) return;
        if (status.runningInDocker) {
          console.log(`[updater] Update available (${status.latestTag}) — Docker deployments update via Watchtower, not this scheduler.`);
          return;
        }

        const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
        if (!settings?.autoUpdateEnabled) {
          console.log(`[updater] Update available (${status.latestTag}) but auto-update is disabled — not applying.`);
          return;
        }

        const result = await applyUpdate();
        if (result.applied) {
          console.log("[updater] Restarting process to run the updated code...");
          process.exit(0);
        }
      } catch (err) {
        console.error("[updater] Scheduled update check failed:", err);
      }
    },
    { name: "omega-update-check", noOverlap: true }
  );

  console.log(`[updater] Update checker scheduled (${CRON_EXPRESSION}).`);
}
