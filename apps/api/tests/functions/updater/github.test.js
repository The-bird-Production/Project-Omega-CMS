import { jest } from "@jest/globals";

const { fetchLatestRelease } = await import("../../../Functions/Updater/github.js");

function mockFetchOnce(response) {
  global.fetch = jest.fn().mockResolvedValue(response);
}

describe("fetchLatestRelease", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns null when the repo has no releases yet (404)", async () => {
    mockFetchOnce({ status: 404, ok: false });
    await expect(fetchLatestRelease()).resolves.toBeNull();
  });

  test("throws on a non-ok, non-404 response", async () => {
    mockFetchOnce({ status: 500, ok: false, statusText: "Internal Server Error" });
    await expect(fetchLatestRelease()).rejects.toThrow(/GitHub API error/);
  });

  test("returns parsed release data for a valid full-SHA target", async () => {
    mockFetchOnce({
      status: 200,
      ok: true,
      json: async () => ({
        tag_name: "build-12-abc1234",
        target_commitish: "A".repeat(40), // uppercase on purpose: must be normalized to lowercase
        html_url: "https://github.com/The-bird-Production/Project-Omega-CMS/releases/tag/build-12-abc1234",
        published_at: "2026-01-01T00:00:00Z",
      }),
    });

    const release = await fetchLatestRelease();

    expect(release).toEqual({
      tagName: "build-12-abc1234",
      commitSha: "a".repeat(40),
      htmlUrl: "https://github.com/The-bird-Production/Project-Omega-CMS/releases/tag/build-12-abc1234",
      publishedAt: "2026-01-01T00:00:00Z",
    });
  });

  test.each([
    "main",
    "not-a-sha",
    "a".repeat(39), // too short
    "g".repeat(40), // invalid hex character
    "",
  ])("refuses to trust a release whose target_commitish isn't a full SHA: %p", async (targetCommitish) => {
    // Regression guard: this value eventually flows into `git fetch`/`git
    // worktree add` subprocess calls — it must never be trusted just
    // because it came back from a JSON response.
    mockFetchOnce({
      status: 200,
      ok: true,
      json: async () => ({
        tag_name: "build-1-deadbeef",
        target_commitish: targetCommitish,
        html_url: "https://example.com",
        published_at: "2026-01-01T00:00:00Z",
      }),
    });

    await expect(fetchLatestRelease()).rejects.toThrow(/not a full commit SHA/);
  });
});
