import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Docker images don't ship a .git directory (.dockerignore excludes it) and
// updates there are delivered by Watchtower recreating the container, not by
// this module — /.dockerenv is the standard, well-known way to detect
// "running inside a Docker container" from within the container itself.
export function isRunningInDocker(): boolean {
  return fs.existsSync("/.dockerenv");
}

// Returns null when `cwd` isn't a git checkout (e.g. inside Docker) rather
// than throwing — that's an expected, normal state for this function.
export async function getCurrentCommit(cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd });
    return stdout.trim().toLowerCase();
  } catch {
    return null;
  }
}
