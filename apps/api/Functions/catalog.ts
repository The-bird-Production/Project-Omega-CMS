// Reads the curated list of "validated" plugins/themes from a dedicated
// public GitHub repo (default: The-bird-Production/Omega-Catalog), so the
// admin panel can offer a "browse catalog" experience instead of requiring
// every install to start from a pasted owner/repo string. Overridable via
// CATALOG_REPO for anyone self-hosting who wants to curate their own list.
import { parseRepoInput } from "./githubRelease.js";

export interface CatalogEntry {
  repo: string;
  name: string;
  description: string;
}

const DEFAULT_CATALOG_REPO = "The-bird-Production/Omega-Catalog";
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { entries: CatalogEntry[]; fetchedAt: number }>();

function catalogRepo(): string {
  return parseRepoInput(process.env.CATALOG_REPO || DEFAULT_CATALOG_REPO);
}

function isValidEntry(value: unknown): value is CatalogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.repo === "string" && typeof entry.name === "string" && typeof entry.description === "string";
}

// Fetches plugins.json or themes.json from the catalog repo's default
// branch via the GitHub Contents API (branch-name agnostic, unlike a
// hardcoded raw.githubusercontent.com/.../main/ URL). Unauthenticated,
// same reasoning as fetchLatestRelease: it's a public repo, HTTPS +
// GitHub's own infrastructure is the integrity guarantee.
export async function fetchCatalog(kind: "plugins" | "themes"): Promise<CatalogEntry[]> {
  const cacheKey = `${catalogRepo()}:${kind}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.entries;
  }

  const res = await fetch(`https://api.github.com/repos/${catalogRepo()}/contents/${kind}.json`, {
    headers: { Accept: "application/vnd.github.raw+json", "User-Agent": "omega-cms" },
  });

  if (res.status === 404) {
    const entries: CatalogEntry[] = [];
    cache.set(cacheKey, { entries, fetchedAt: Date.now() });
    return entries;
  }
  if (!res.ok) {
    throw new Error(`Erreur API GitHub (${res.status}) en lisant le catalogue`);
  }

  const data = await res.json();
  const entries = Array.isArray(data) ? data.filter(isValidEntry) : [];
  cache.set(cacheKey, { entries, fetchedAt: Date.now() });
  return entries;
}

export function clearCatalogCache(): void {
  cache.clear();
}
