import { jest } from "@jest/globals";

jest.unstable_mockModule("@omega/db", () => ({ prisma: {} }));
jest.unstable_mockModule("@blocknote/server-util", () => ({ ServerBlockNoteEditor: { create: () => ({}) } }));

const { isAlreadyMigrated, migrateRows } = await import("../../scripts/migrate-content-to-blocks.mjs");

describe("isAlreadyMigrated", () => {
  test("treats empty/null bodies as already migrated (nothing to do)", () => {
    expect(isAlreadyMigrated(null)).toBe(true);
    expect(isAlreadyMigrated(undefined)).toBe(true);
    expect(isAlreadyMigrated("")).toBe(true);
  });

  test("treats a JSON array body as already migrated", () => {
    expect(isAlreadyMigrated(JSON.stringify([{ type: "paragraph" }]))).toBe(true);
  });

  test("treats raw HTML as not yet migrated", () => {
    expect(isAlreadyMigrated("<p>Hello</p>")).toBe(false);
  });

  test("treats non-array JSON as not yet migrated (shouldn't happen, but don't skip it silently)", () => {
    expect(isAlreadyMigrated(JSON.stringify({ not: "an array" }))).toBe(false);
  });
});

describe("migrateRows", () => {
  test("converts unmigrated rows and writes the result back", async () => {
    const rows = [{ id: 1, body: "<p>Hello</p>" }];
    const parseHTMLToBlocks = jest.fn().mockResolvedValue([{ type: "paragraph", content: "Hello" }]);
    const updateOne = jest.fn().mockResolvedValue({});

    const failures = await migrateRows("page", rows, updateOne, parseHTMLToBlocks);

    expect(failures).toBe(0);
    expect(parseHTMLToBlocks).toHaveBeenCalledWith("<p>Hello</p>");
    expect(updateOne).toHaveBeenCalledWith(1, JSON.stringify([{ type: "paragraph", content: "Hello" }]));
  });

  test("skips rows that are already migrated without calling the parser", async () => {
    const rows = [{ id: 1, body: JSON.stringify([{ type: "paragraph" }]) }, { id: 2, body: null }];
    const parseHTMLToBlocks = jest.fn();
    const updateOne = jest.fn();

    const failures = await migrateRows("page", rows, updateOne, parseHTMLToBlocks);

    expect(failures).toBe(0);
    expect(parseHTMLToBlocks).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  test("counts a failed conversion without stopping the rest of the batch", async () => {
    const rows = [
      { id: 1, body: "<p>bad</p>" },
      { id: 2, body: "<p>good</p>" },
    ];
    const parseHTMLToBlocks = jest
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce([{ type: "paragraph", content: "good" }]);
    const updateOne = jest.fn().mockResolvedValue({});

    const failures = await migrateRows("page", rows, updateOne, parseHTMLToBlocks);

    expect(failures).toBe(1);
    expect(updateOne).toHaveBeenCalledTimes(1);
    expect(updateOne).toHaveBeenCalledWith(2, JSON.stringify([{ type: "paragraph", content: "good" }]));
  });
});
