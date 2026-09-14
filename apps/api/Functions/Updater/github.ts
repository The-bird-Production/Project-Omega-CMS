// This repo is public, so the GitHub REST API is reachable anonymously over
// HTTPS — no token needed, and no custom crypto to build/maintain: HTTPS +
// GitHub's own infrastructure IS the integrity guarantee for what this
// returns, the same way `git clone`/`git pull` from the canonical origin
// already is.
const REPO = "The-bird-Production/Project-Omega-CMS";
const SHA_RE = /^[0-9a-f]{40}$/i;

export interface LatestRelease {
  tagName: string;
  commitSha: string;
  htmlUrl: string;
  publishedAt: string;
}

// Returns null if the repo has no releases yet (a fresh fork, or before the
// first release.yml run) — that's a normal, expected state, not an error.
export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "omega-cms-updater",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub API error checking for updates: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { tag_name: string; target_commitish: string; html_url: string; published_at: string };

  // release.yml always creates releases with `--target "$(git rev-parse HEAD)"`
  // (a full commit SHA), never a branch name — validated here too as the
  // last line of defense before this value is ever used to drive a git
  // fetch/checkout: never trust an arbitrary string from a JSON response
  // enough to hand it to a subprocess.
  if (!SHA_RE.test(data.target_commitish)) {
    throw new Error(
      `Refusing to trust release "${data.tag_name}": target_commitish is not a full commit SHA (${data.target_commitish})`
    );
  }

  return {
    tagName: data.tag_name,
    commitSha: data.target_commitish.toLowerCase(),
    htmlUrl: data.html_url,
    publishedAt: data.published_at,
  };
}
