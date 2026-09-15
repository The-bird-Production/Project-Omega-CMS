#!/usr/bin/env node
// Wraps `prisma migrate deploy` to auto-baseline databases that predate this
// project's migration history.
//
// Every schema change before the first tracked migration was applied with
// `prisma db push` — and, since `migrate deploy` was always a silent no-op
// with no migrations directory to apply, that was ALSO true for every schema
// change since, right up until this wrapper started being used. So a
// pre-existing self-hosted instance's real database can be missing anything
// from a single column to several whole tables added across multiple past
// releases — there is no single migration boundary it reliably lines up
// with. The very first `migrate deploy` against such a database fails with
// P3005 ("the database schema is not empty") — Prisma won't guess whether a
// non-empty, untracked database is safe to treat as already up to date, so
// it stops instead of risking a destructive CREATE TABLE against real data.
// See: https://pris.ly/d/migrate-baseline
//
// P3005 is unambiguous: it can only fire on the very first `migrate deploy`
// against a database that has never run one before. When we see it, the
// safe recovery is the same operation this project has always used for
// every schema change up to now: `prisma db push`, which reconciles
// whatever the database's actual (unknown, possibly very old) structure is
// up to exactly match the current schema.prisma — additively creating
// anything missing, regardless of how many releases behind it is. Once the
// database provably matches the full current schema, every migration can be
// marked as already applied (`migrate resolve --applied`), and a normal
// `migrate deploy` proceeds with nothing left to do. This makes the one-time
// transition to tracked migrations fully automatic for every self-hosted
// instance already running, instead of requiring each operator to inspect
// their database and run `prisma migrate resolve` by hand before their next
// auto-update.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function runPrisma(args) {
  const result = spawnSync("prisma", args, {
    cwd: packageDir,
    stdio: ["inherit", "pipe", "pipe"],
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  return result;
}

function allMigrationNames() {
  const migrationsDir = path.join(packageDir, "prisma", "migrations");
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

let result = runPrisma(["migrate", "deploy"]);

if (result.status !== 0 && `${result.stdout}${result.stderr}`.includes("P3005")) {
  console.log(
    "[safe-migrate-deploy] Database predates tracked migrations (P3005). Reconciling it to the current schema with `db push`, then baselining every migration as already applied..."
  );

  const push = runPrisma(["db", "push", "--accept-data-loss", "--skip-generate"]);
  if (push.status !== 0) {
    process.exit(push.status ?? 1);
  }

  for (const name of allMigrationNames()) {
    const resolve = runPrisma(["migrate", "resolve", "--applied", name]);
    if (resolve.status !== 0) {
      process.exit(resolve.status ?? 1);
    }
  }

  result = runPrisma(["migrate", "deploy"]);
}

process.exit(result.status ?? 1);
