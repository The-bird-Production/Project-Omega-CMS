import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { prisma } from "@omega/db";
import { checkForUpdate, REPO_ROOT } from "./checkForUpdate.js";

const execFileAsync = promisify(execFile);
const SHA_RE = /^[0-9a-f]{40}$/i;

// Paths holding *this instance's* data — uploads, installed plugins/themes,
// local config, secrets — never overwritten by an update. This mirrors
// exactly the boundary docker-compose.yml draws with bind mounts for the
// Docker deployment (see PRESERVE_PATHS vs. the `volumes:` list there): an
// update replaces application code, never runtime data.
const PRESERVE_PATHS = [
  "apps/api/Public",
  "apps/api/Plugins",
  "apps/api/Themes",
  "apps/api/Themes_style",
  "apps/api/config",
  "apps/api/backups",
  "apps/api/temp",
  "apps/api/.env",
  "apps/api/.env.test",
  "apps/web/.env",
  "apps/web/public",
  ".env",
];

async function run(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(cmd, args, { cwd, maxBuffer: 1024 * 1024 * 50 });
}

async function logEvent(action: string, color: "green" | "red" | "info") {
  try {
    await prisma.log.create({ data: { action, user: "updater", color } });
  } catch (err) {
    console.error("[updater] Failed to write log entry:", err);
  }
}

// Best-effort DB backup before touching anything — mirrors the mysqldump
// approach already used in InstallPlugins.ts (including passing the
// password via MYSQL_PWD, not argv, for the same ps-listing reason).
// Returns null (and proceeds anyway) if there's no DATABASE_URL to dump —
// that's a config problem the update itself shouldn't block on.
async function backupDatabase(): Promise<string | null> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  const db = new URL(databaseUrl);
  const backupDir = path.join(REPO_ROOT, "apps/api/backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `pre-update-${timestamp}.sql`);

  await new Promise<void>((resolve, reject) => {
    execFile(
      "mysqldump",
      ["-u", db.username, "-h", db.hostname, "-P", db.port || "3306", db.pathname.replace("/", "")],
      { maxBuffer: 1024 * 1024 * 50, env: { ...process.env, MYSQL_PWD: db.password } },
      (error, stdout, stderr) => {
        if (error) return reject(error || new Error(stderr));
        fs.writeFileSync(backupPath, stdout);
        resolve();
      }
    );
  });

  return backupPath;
}

export interface ApplyResult {
  applied: boolean;
  reason?: string;
  fromCommit?: string | null;
  toCommit?: string;
}

// Downloads nothing directly: everything comes from `git fetch`/`git
// worktree` against the same origin remote the deployment was cloned from
// (HTTPS to github.com — the transport-level integrity this repo relies on
// everywhere else, e.g. `git clone`/`git pull`, not a bespoke signature
// scheme). The commit to fetch is validated as a real SHA before this
// function is ever called (see github.ts) and re-validated here as a second
// line of defense, since this is the one place that hands it to a subprocess.
export async function applyUpdate(): Promise<ApplyResult> {
  const status = await checkForUpdate();

  if (status.runningInDocker) {
    return { applied: false, reason: "Running in Docker — updates are delivered by Watchtower recreating the container, not this updater." };
  }
  if (!status.updateAvailable || !status.latestCommit) {
    return { applied: false, reason: "Already up to date." };
  }
  if (!SHA_RE.test(status.latestCommit)) {
    throw new Error(`Refusing to apply update: latest commit is not a valid SHA (${status.latestCommit})`);
  }

  const fromCommit = status.currentCommit;
  const toCommit = status.latestCommit;
  console.log(`[updater] Applying update: ${fromCommit ?? "(unknown)"} -> ${toCommit}`);

  const backupPath = await backupDatabase();
  console.log(`[updater] Database backup: ${backupPath ?? "skipped (no DATABASE_URL)"}`);

  const worktreeDir = path.join(REPO_ROOT, ".update-worktree");

  try {
    // Clean up any leftover worktree from a previous failed attempt before
    // starting a new one.
    await run("git", ["worktree", "remove", "--force", worktreeDir], REPO_ROOT).catch(() => {});

    await run("git", ["fetch", "origin", toCommit], REPO_ROOT);
    await run("git", ["worktree", "add", "--detach", worktreeDir, toCommit], REPO_ROOT);

    // Sync the new code over the live deployment, excluding this instance's
    // own data (see PRESERVE_PATHS above).
    const rsyncArgs = [
      "-a",
      "--delete",
      ...PRESERVE_PATHS.flatMap((p) => ["--exclude", p]),
      "--exclude", ".git",
      "--exclude", ".update-worktree",
      "--exclude", "node_modules",
      `${worktreeDir}/`,
      `${REPO_ROOT}/`,
    ];
    await run("rsync", rsyncArgs, REPO_ROOT);

    // Advance the local `main` ref to match what's now actually on disk —
    // HEAD stays a symbolic ref to `main` (a normal clone's default), so
    // this doesn't leave the deployment in a detached-HEAD state.
    await run("git", ["update-ref", "refs/heads/main", toCommit], REPO_ROOT);

    console.log("[updater] Installing dependencies...");
    await run("pnpm", ["install", "--frozen-lockfile"], REPO_ROOT);

    console.log("[updater] Regenerating Prisma client and applying migrations...");
    await run("pnpm", ["--filter", "@omega/db", "run", "generate"], REPO_ROOT);
    await run("pnpm", ["--filter", "@omega/db", "run", "migrate:deploy:safe"], REPO_ROOT);

    // The rsync above already updated apps/web's code too (REPO_ROOT covers
    // the whole monorepo), but that's a separate process under its own
    // systemd unit — this process restarting itself (via the exit(0) below)
    // doesn't touch it. Best-effort restart; failure here doesn't fail the
    // update itself (apps/api is already on the new code either way), it
    // just means apps/web needs a manual `systemctl restart omega-web`.
    // Requires the deployment to grant this narrowly-scoped passwordless
    // sudo rule — see docs/deploy/bare-metal.md.
    await run("sudo", ["systemctl", "restart", "omega-web"], REPO_ROOT).catch((err) => {
      console.warn("[updater] Could not restart omega-web automatically (see docs/deploy/bare-metal.md for the required sudoers rule):", err.message);
    });

    await logEvent(`Auto-update applied: ${(fromCommit ?? "unknown").slice(0, 7)} -> ${toCommit.slice(0, 7)}`, "green");
    console.log("[updater] Update applied. Exiting so the process supervisor (systemd) restarts with the new code.");

    return { applied: true, fromCommit, toCommit };
  } catch (err) {
    console.error("[updater] Update failed — deployment may be partially updated. Check the backup at", backupPath, err);
    await logEvent(`Auto-update FAILED (${fromCommit ?? "unknown"} -> ${toCommit}): ${(err as Error).message}`, "red");
    throw err;
  } finally {
    await run("git", ["worktree", "remove", "--force", worktreeDir], REPO_ROOT).catch(() => {});
  }
}
