import fs from "fs";
import path from "path";
import axios from "axios";
import AdmZip from "adm-zip";

const REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export interface GithubReleaseAsset {
  name: string;
  browserDownloadUrl: string;
}

export interface GithubRelease {
  repo: string;
  tagName: string;
  htmlUrl: string;
  assets: GithubReleaseAsset[];
  zipballUrl: string;
}

// Accepts "owner/repo" or a full GitHub URL (with or without protocol/.git
// suffix) and normalizes to "owner/repo". Throws on anything else, since
// this value ends up in a GitHub API URL path.
export function parseRepoInput(input: string): string {
  const trimmed = (input || "").trim();
  const urlMatch = trimmed.match(/^(?:https?:\/\/)?github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/i);
  const candidate = urlMatch ? `${urlMatch[1]}/${urlMatch[2]}` : trimmed;
  if (!REPO_RE.test(candidate)) {
    throw new Error(`Dépôt GitHub invalide : "${input}". Format attendu : owner/repo.`);
  }
  return candidate;
}

// This project's own auto-updater deliberately calls the GitHub API
// unauthenticated (public repo — HTTPS + GitHub's own infrastructure is the
// integrity guarantee, the same way `git clone` from the canonical origin
// already is). Same reasoning here: only public repositories are supported,
// so there's no token to configure, rotate, or leak. Private-repo support
// (a PAT read from an env var) is a reasonable future extension, not built
// here to keep this scoped.
export async function fetchLatestRelease(repo: string): Promise<GithubRelease | null> {
  const normalized = parseRepoInput(repo);
  const res = await fetch(`https://api.github.com/repos/${normalized}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "omega-cms" },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Erreur API GitHub (${res.status}) pour ${normalized}`);
  }

  const data = (await res.json()) as {
    tag_name: string;
    html_url: string;
    zipball_url: string;
    assets?: { name: string; browser_download_url: string }[];
  };

  return {
    repo: normalized,
    tagName: data.tag_name,
    htmlUrl: data.html_url,
    zipballUrl: data.zipball_url,
    assets: (data.assets ?? []).map((a) => ({ name: a.name, browserDownloadUrl: a.browser_download_url })),
  };
}

// Prefers an explicitly attached release asset named `assetName` (e.g.
// "plugin.zip"); falls back to GitHub's auto-generated source zipball
// (present on every release with zero extra CI setup from the package
// author). The zipball wraps its contents in one extra top-level
// "<owner>-<repo>-<sha>/" directory — needsUnwrap tells the caller to strip
// it after extraction (see unwrapSingleTopLevelDir).
export async function downloadReleaseArchive(
  release: GithubRelease,
  assetName: string
): Promise<{ zip: AdmZip; needsUnwrap: boolean }> {
  const explicitAsset = release.assets.find((a) => a.name === assetName);
  const url = explicitAsset ? explicitAsset.browserDownloadUrl : release.zipballUrl;
  const { data } = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
  return { zip: new AdmZip(data), needsUnwrap: !explicitAsset };
}

// Flattens a directory that contains exactly one subdirectory (GitHub
// zipball layout) by moving that subdirectory's contents up one level. A
// no-op for anything else, so it's safe to call unconditionally.
export function unwrapSingleTopLevelDir(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  if (entries.length !== 1 || !entries[0].isDirectory()) return;

  const nested = path.join(dir, entries[0].name);
  for (const item of fs.readdirSync(nested)) {
    fs.renameSync(path.join(nested, item), path.join(dir, item));
  }
  fs.rmdirSync(nested);
}

// Derives a filesystem/route-safe local id from a GitHub repo string, e.g.
// "the-bird-production/omega-theme" -> "the-bird-production-omega-theme".
// Deterministic, so re-installing the same repo (update) always lands on
// the same local plugin/theme id. Matches the charset isSafePluginId
// requires (letters, digits, "_", "-") so callers don't need a second check.
export function repoToLocalId(repo: string): string {
  return repo.replace(/[^A-Za-z0-9_-]/g, "-");
}

// This project stores which GitHub repo a plugin/theme was installed from
// as source: "github:owner/repo" — extracts the repo back out for the
// update-check/apply flow. Returns null for anything else (e.g. the old
// "marketplace" value on a package installed before this feature existed).
export function repoFromSource(source: string | null | undefined): string | null {
  if (!source || !source.startsWith("github:")) return null;
  return source.slice("github:".length);
}
