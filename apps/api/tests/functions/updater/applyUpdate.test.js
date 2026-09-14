import { jest } from "@jest/globals";

const checkForUpdateMock = jest.fn();

jest.unstable_mockModule("../../../Functions/Updater/checkForUpdate.js", () => ({
  checkForUpdate: checkForUpdateMock,
  REPO_ROOT: "/tmp/omega-test-root",
}));

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { log: { create: jest.fn() } },
}));

const { applyUpdate } = await import("../../../Functions/Updater/applyUpdate.js");

describe("applyUpdate guard clauses", () => {
  // These only exercise the early-return paths — the actual git worktree +
  // rsync + pnpm sequence is not covered by an automated test (see the PR
  // description: not something safely simulable without a real git remote
  // and filesystem, and not exercised in this sandbox).

  beforeEach(() => {
    checkForUpdateMock.mockReset();
  });

  test("refuses to apply when running in Docker, even if an update is available", async () => {
    checkForUpdateMock.mockResolvedValue({
      runningInDocker: true,
      updateAvailable: true,
      currentCommit: null,
      latestCommit: "a".repeat(40),
    });

    const result = await applyUpdate();

    expect(result.applied).toBe(false);
    expect(result.reason).toMatch(/Watchtower/);
  });

  test("does nothing when already up to date", async () => {
    checkForUpdateMock.mockResolvedValue({
      runningInDocker: false,
      updateAvailable: false,
      currentCommit: "a".repeat(40),
      latestCommit: "a".repeat(40),
    });

    const result = await applyUpdate();

    expect(result.applied).toBe(false);
    expect(result.reason).toMatch(/up to date/);
  });

  test("refuses to apply if the latest commit somehow isn't a valid SHA", async () => {
    // Defense in depth: github.ts already validates this, but applyUpdate
    // re-checks right before it would ever reach a subprocess call.
    checkForUpdateMock.mockResolvedValue({
      runningInDocker: false,
      updateAvailable: true,
      currentCommit: "a".repeat(40),
      latestCommit: "not-a-real-sha",
    });

    await expect(applyUpdate()).rejects.toThrow(/not a valid SHA/);
  });
});
