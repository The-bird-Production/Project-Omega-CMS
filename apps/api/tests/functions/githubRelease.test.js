import fs from "fs";
import os from "os";
import path from "path";
import {
  parseRepoInput,
  repoToLocalId,
  repoFromSource,
  unwrapSingleTopLevelDir,
} from "../../Functions/githubRelease.js";

describe("parseRepoInput", () => {
  test("accepts a plain owner/repo string", () => {
    expect(parseRepoInput("the-bird-production/omega-theme")).toBe("the-bird-production/omega-theme");
  });

  test("accepts a full https github.com URL", () => {
    expect(parseRepoInput("https://github.com/owner/repo")).toBe("owner/repo");
  });

  test("accepts a github.com URL with no protocol", () => {
    expect(parseRepoInput("github.com/owner/repo")).toBe("owner/repo");
  });

  test("strips a trailing .git and slash from a URL", () => {
    expect(parseRepoInput("https://github.com/owner/repo.git/")).toBe("owner/repo");
  });

  test("trims surrounding whitespace", () => {
    expect(parseRepoInput("  owner/repo  ")).toBe("owner/repo");
  });

  test.each([
    "",
    "not-a-repo",
    "owner/repo/extra",
    "owner/../../../etc/passwd",
    "https://evil.com/owner/repo",
    "owner/repo; rm -rf /",
  ])("rejects invalid input %p", (input) => {
    expect(() => parseRepoInput(input)).toThrow(/Dépôt GitHub invalide/);
  });
});

describe("repoToLocalId", () => {
  test("replaces the slash and any other unsafe character with a dash", () => {
    expect(repoToLocalId("owner/repo")).toBe("owner-repo");
    expect(repoToLocalId("owner/my.repo")).toBe("owner-my-repo");
  });

  test("is deterministic (same repo always yields the same id)", () => {
    expect(repoToLocalId("owner/repo")).toBe(repoToLocalId("owner/repo"));
  });

  test("output only ever contains characters isSafePluginId allows", () => {
    expect(repoToLocalId("Owner_1/Repo.name-2")).toMatch(/^[a-zA-Z0-9_-]+$/);
  });
});

describe("repoFromSource", () => {
  test("extracts the repo from a github: source string", () => {
    expect(repoFromSource("github:owner/repo")).toBe("owner/repo");
  });

  test("returns null for a non-github source (e.g. the old marketplace value)", () => {
    expect(repoFromSource("marketplace")).toBeNull();
  });

  test("returns null for null/undefined", () => {
    expect(repoFromSource(null)).toBeNull();
    expect(repoFromSource(undefined)).toBeNull();
  });
});

describe("unwrapSingleTopLevelDir", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omega-unwrap-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("flattens a single nested top-level directory (GitHub zipball layout)", () => {
    const nested = path.join(tmpDir, "owner-repo-abc1234");
    fs.mkdirSync(nested);
    fs.writeFileSync(path.join(nested, "plugin.json"), "{}");
    fs.mkdirSync(path.join(nested, "Routes"));
    fs.writeFileSync(path.join(nested, "Routes", "MainRoutes.js"), "");

    unwrapSingleTopLevelDir(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, "owner-repo-abc1234"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, "plugin.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "Routes", "MainRoutes.js"))).toBe(true);
  });

  test("is a no-op when there are multiple top-level entries (explicit asset layout)", () => {
    fs.writeFileSync(path.join(tmpDir, "plugin.json"), "{}");
    fs.mkdirSync(path.join(tmpDir, "Routes"));

    unwrapSingleTopLevelDir(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, "plugin.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "Routes"))).toBe(true);
  });

  test("is a no-op when the single top-level entry is a file, not a directory", () => {
    fs.writeFileSync(path.join(tmpDir, "plugin.zip"), "");

    unwrapSingleTopLevelDir(tmpDir);

    expect(fs.existsSync(path.join(tmpDir, "plugin.zip"))).toBe(true);
  });
});
