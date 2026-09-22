#!/usr/bin/env node
// Runs `next build` then `next start`, and rebuilds+restarts on request —
// this is what lets a theme/plugin installed at runtime actually take
// effect: Next.js bakes every dynamic import's possible targets in at
// build time (see lib/pageTemplates/render.js's comment for how this was
// confirmed), so a theme installed after the image was built is invisible
// to the already-running production server no matter what the code looks
// like. There's no way around a real rebuild+restart.
//
// Rebuild trigger: apps/api's InstallTheme.ts/InstallPlugins.ts write a
// sentinel file into Themes/ after a successful install — the same
// directory already bind-mounted into both containers (see
// docker-compose.yml), so no new shared volume or HTTP endpoint is
// needed. This process polls for it.
//
// Downtime: the rebuild itself (the slow part, minutes) happens with the
// OLD server still serving traffic — zero downtime for that part. Only
// the final swap (stop old, start new) is a real gap: two processes can't
// both bind the same port, and this project has no reverse proxy in
// front to hand traffic between two ports without one, so that swap
// takes a few seconds rather than being instant.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const APP_DIR = process.cwd();
const REBUILD_SENTINEL = path.resolve(APP_DIR, "app", "Themes", ".rebuild-requested");
const POLL_INTERVAL_MS = 10_000;
const SHUTDOWN_GRACE_MS = 10_000;
const STARTUP_RETRY_ATTEMPTS = 6;
const STARTUP_RETRY_DELAY_MS = 1_000;
const STARTUP_STABLE_MS = 3_000;

let server = null;
let stopping = false;

function log(...args) {
  console.log("[supervisor]", ...args);
}

// Runs Next's own bin script directly with the current `node` binary,
// rather than through `pnpm exec` — that resolves to pnpm.cmd on Windows,
// a batch file spawn() can only run via a shell, and a shell-wrapped
// child there doesn't forward signals to the real process it started
// (confirmed while testing this: killing it left the actual next start
// process running, still holding the port). `node <script>` needs no
// shell on any platform, so signals reach the real process everywhere.
const NEXT_BIN = createRequire(import.meta.url).resolve("next/dist/bin/next");

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [NEXT_BIN, ...args], { cwd: APP_DIR, stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(" ")} exited with code ${code}`))));
    child.on("error", reject);
  });
}

// Waits for the child to actually exit (not just for the kill signal to be
// sent). Marks it as intentionally stopped BEFORE sending the signal so
// startServerReliably()'s later exit listener (see below) can tell this
// apart from a real crash.
function stopServer(child) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null) return resolve();
    child.intentionalStop = true;
    const timer = setTimeout(() => child.kill("SIGKILL"), SHUTDOWN_GRACE_MS);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

// Starts `next start`, retrying a few times if it exits almost immediately.
// Confirmed by testing this against a real swap: the OS can take a moment
// to fully release the previous process's port even after its own 'exit'
// event has already fired, so the replacement's first attempt can still
// hit EADDRINUSE. Rather than trying to predict when the port is free
// (tried an active connect-probe first — it wasn't reliable enough, still
// raced this the same way), this reacts to what next start itself
// reports: an attempt that survives STARTUP_STABLE_MS is considered
// successful, and only then does an unexpected exit later in its life
// become fatal (letting Docker's `restart: always` recover normally, the
// pre-supervisor behavior for a genuine crash).
async function startServerReliably() {
  for (let attempt = 1; attempt <= STARTUP_RETRY_ATTEMPTS; attempt++) {
    log(`Starting next start (attempt ${attempt}/${STARTUP_RETRY_ATTEMPTS})...`);
    const child = spawn(process.execPath, [NEXT_BIN, "start"], { cwd: APP_DIR, stdio: "inherit" });

    const survived = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(true), STARTUP_STABLE_MS);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve(false);
      });
    });

    if (survived) {
      child.on("exit", (code, signal) => {
        if (child.intentionalStop || stopping) return;
        log(`next start exited unexpectedly (code=${code}, signal=${signal})`);
        process.exit(code ?? 1);
      });
      return child;
    }

    log(`Attempt ${attempt} exited within ${STARTUP_STABLE_MS}ms — retrying in ${STARTUP_RETRY_DELAY_MS}ms...`);
    await new Promise((r) => setTimeout(r, STARTUP_RETRY_DELAY_MS));
  }
  throw new Error(`next start did not stay up after ${STARTUP_RETRY_ATTEMPTS} attempts`);
}

let rebuilding = false;
async function rebuildAndSwap() {
  if (rebuilding) return;
  rebuilding = true;
  try {
    log("Rebuild requested — building (current server keeps serving traffic)...");
    await run(["build"]);
    log("Build succeeded — swapping to the new build...");
    await stopServer(server);
    server = await startServerReliably();
    log("Swap complete.");
  } catch (err) {
    log("Rebuild/swap failed:", err.message);
    // If the failure happened after stopping the old server, there's
    // nothing left serving traffic — that's worse than a stale build, so
    // exit and let Docker's `restart: always` recover with a fresh full
    // build+start rather than silently running with no server at all.
    if (!server || server.exitCode !== null) {
      log("No server is running after a failed rebuild — exiting so it can be restarted.");
      process.exit(1);
    }
  } finally {
    rebuilding = false;
    fs.rmSync(REBUILD_SENTINEL, { force: true });
  }
}

function pollForRebuildRequest() {
  setInterval(() => {
    if (fs.existsSync(REBUILD_SENTINEL) && !rebuilding) rebuildAndSwap();
  }, POLL_INTERVAL_MS);
}

async function main() {
  fs.rmSync(REBUILD_SENTINEL, { force: true });
  log("Initial build...");
  await run(["build"]);
  server = await startServerReliably();
  pollForRebuildRequest();
}

for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, async () => {
    stopping = true;
    log(`Received ${sig}, shutting down...`);
    await stopServer(server);
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[supervisor] Fatal error during startup:", err);
  process.exit(1);
});
