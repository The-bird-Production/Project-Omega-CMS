#!/usr/bin/env node
// Wraps `prisma migrate deploy` to auto-baseline databases that predate this
// project's migration history.
//
// Every schema change before this one was applied with `prisma db push`
// (no tracked migrations existed). The very first time `migrate deploy` runs
// against one of those pre-existing databases, Prisma refuses with P3005
// ("the database schema is not empty") — it won't guess whether a non-empty,
// untracked database is safe to treat as already up to date, so it stops
// instead of risking a destructive CREATE TABLE against real data.
// See: https://pris.ly/d/migrate-baseline
//
// P3005 is unambiguous: it can only fire on the very first `migrate deploy`
// against a database that has never run one before. So when we see it, it's
// always safe to mark the oldest migration (the schema baseline captured in
// prisma/migrations/*_baseline) as already applied, without actually running
// it — the tables it would create already exist, from the prior `db push`
// usage. Prisma then applies any newer migrations normally. This makes the
// one-time transition to tracked migrations fully automatic for every
// self-hosted instance already running, instead of requiring each operator
// to run `prisma migrate resolve` by hand before their next auto-update.
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

function oldestMigrationName() {
  const migrationsDir = path.join(packageDir, "prisma", "migrations");
  const names = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (names.length === 0) {
    throw new Error("No migrations found under prisma/migrations");
  }
  return names[0];
}

let result = runPrisma(["migrate", "deploy"]);

if (result.status !== 0 && `${result.stdout}${result.stderr}`.includes("P3005")) {
  const baseline = oldestMigrationName();
  console.log(
    `[safe-migrate-deploy] Database predates tracked migrations (P3005). Baselining ${baseline} as already applied...`
  );
  const resolve = runPrisma(["migrate", "resolve", "--applied", baseline]);
  if (resolve.status !== 0) {
    process.exit(resolve.status ?? 1);
  }
  result = runPrisma(["migrate", "deploy"]);
}

process.exit(result.status ?? 1);
