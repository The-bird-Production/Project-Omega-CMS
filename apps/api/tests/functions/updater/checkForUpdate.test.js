import { jest } from "@jest/globals";

const fetchLatestReleaseMock = jest.fn();
const getCurrentCommitMock = jest.fn();
const isRunningInDockerMock = jest.fn();
const appSettingsUpsertMock = jest.fn();

jest.unstable_mockModule("../../../Functions/Updater/github.js", () => ({
  fetchLatestRelease: fetchLatestReleaseMock,
}));

jest.unstable_mockModule("../../../Functions/Updater/gitState.js", () => ({
  getCurrentCommit: getCurrentCommitMock,
  isRunningInDocker: isRunningInDockerMock,
}));

jest.unstable_mockModule("@omega/db", () => ({
  prisma: {
    appSettings: { upsert: appSettingsUpsertMock },
  },
}));

const { checkForUpdate } = await import("../../../Functions/Updater/checkForUpdate.js");

const SHA_A = "a".repeat(40);
const SHA_B = "b".repeat(40);

describe("checkForUpdate", () => {
  beforeEach(() => {
    fetchLatestReleaseMock.mockReset();
    getCurrentCommitMock.mockReset();
    isRunningInDockerMock.mockReset();
    appSettingsUpsertMock.mockReset();
    isRunningInDockerMock.mockReturnValue(false);
  });

  test("reports an update available when the latest release commit differs from the current one", async () => {
    getCurrentCommitMock.mockResolvedValue(SHA_A);
    fetchLatestReleaseMock.mockResolvedValue({
      tagName: "build-2-bbbbbbb",
      commitSha: SHA_B,
      htmlUrl: "https://example.com/releases/build-2",
      publishedAt: "2026-01-02T00:00:00Z",
    });

    const status = await checkForUpdate();

    expect(status.updateAvailable).toBe(true);
    expect(status.currentCommit).toBe(SHA_A);
    expect(status.latestCommit).toBe(SHA_B);
    expect(appSettingsUpsertMock).toHaveBeenCalledTimes(1);
  });

  test("reports no update when already on the latest commit", async () => {
    getCurrentCommitMock.mockResolvedValue(SHA_A);
    fetchLatestReleaseMock.mockResolvedValue({
      tagName: "build-1-aaaaaaa",
      commitSha: SHA_A,
      htmlUrl: "https://example.com/releases/build-1",
      publishedAt: "2026-01-01T00:00:00Z",
    });

    const status = await checkForUpdate();

    expect(status.updateAvailable).toBe(false);
  });

  test("reports no update when there are no releases yet", async () => {
    getCurrentCommitMock.mockResolvedValue(SHA_A);
    fetchLatestReleaseMock.mockResolvedValue(null);

    const status = await checkForUpdate();

    expect(status.updateAvailable).toBe(false);
    expect(status.latestCommit).toBeNull();
  });

  test("never reports an update available when running in Docker, even if commits differ", async () => {
    // In Docker, currentCommit is always null (no .git in the image), which
    // already makes the Boolean(...) check false — this test guards that
    // invariant explicitly since Watchtower, not this code, is what's
    // supposed to update a Docker deployment.
    isRunningInDockerMock.mockReturnValue(true);
    getCurrentCommitMock.mockResolvedValue(null);
    fetchLatestReleaseMock.mockResolvedValue({
      tagName: "build-2-bbbbbbb",
      commitSha: SHA_B,
      htmlUrl: "https://example.com/releases/build-2",
      publishedAt: "2026-01-02T00:00:00Z",
    });

    const status = await checkForUpdate();

    expect(status.runningInDocker).toBe(true);
    expect(status.updateAvailable).toBe(false);
  });
});
