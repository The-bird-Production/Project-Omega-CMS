import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/lib -> apps/api -> apps -> repo root
const rootPackageJsonPath = path.resolve(__dirname, "../../../package.json");

let cachedVersion: string | null = null;

// Single source of truth for "what version is this instance": the root
// package.json's version field. Read once and cached — it can't change
// without a restart anyway.
export function getAppVersion(): string {
  if (cachedVersion) return cachedVersion;
  const raw = fs.readFileSync(rootPackageJsonPath, "utf-8");
  const pkg = JSON.parse(raw) as { version?: string };
  cachedVersion = pkg.version ?? "0.0.0";
  return cachedVersion;
}
