import { jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

const findUniqueMock = jest.fn();
const createMock = jest.fn();
const updateMock = jest.fn();
const revalidateMock = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { page: { findUnique: findUniqueMock, create: createMock, update: updateMock } },
}));
jest.unstable_mockModule("../../Functions/RevalidateWeb.js", () => ({ revalidateWebPaths: revalidateMock }));

const { parsePageData, readThemePages, activeThemeDir, importPages } = await import("../../Functions/PageImport.js");

// A theme folder laid out like apdm-omega-theme: theme.json + content/pages/*.json.
function makeTheme(pages) {
  const themesDir = fs.mkdtempSync(path.join(os.tmpdir(), "omega-themes-"));
  fs.mkdirSync(path.join(themesDir, "default"));
  const dir = path.join(themesDir, "apdm");
  fs.mkdirSync(path.join(dir, "content", "pages"), { recursive: true });
  fs.writeFileSync(path.join(dir, "theme.json"), JSON.stringify({ id: "apdm", name: "Au Pied du Morclan" }));
  for (const [file, content] of Object.entries(pages)) {
    fs.writeFileSync(path.join(dir, "content", "pages", file), typeof content === "string" ? content : JSON.stringify(content));
  }
  return themesDir;
}

describe("parsePageData", () => {
  test("takes the slug from the file name when the JSON has none (theme format)", () => {
    expect(parsePageData({ title: " FAQ ", body: [{ type: "paragraph" }] }, "faq")).toEqual({
      slug: "faq", title: "FAQ", body: [{ type: "paragraph" }],
    });
  });

  test("prefers an explicit slug and normalises its case", () => {
    expect(parsePageData({ slug: "About-Us", title: "Qui", body: [] }, "x").slug).toBe("about-us");
  });

  test("rejects a missing title, a non-array body or an unsafe address", () => {
    expect(() => parsePageData({ body: [] }, "faq")).toThrow("Titre");
    expect(() => parsePageData({ title: "T", body: "<p>html</p>" }, "faq")).toThrow("body");
    expect(() => parsePageData({ title: "T", body: [] }, "../etc/passwd")).toThrow("Adresse");
    expect(() => parsePageData([], "faq")).toThrow();
  });
});

describe("theme pages on disk", () => {
  test("finds the active (non-default) theme and reads each page, reporting broken ones", () => {
    const themesDir = makeTheme({
      "faq.json": { title: "FAQ", body: [{ type: "accordion" }] },
      "home.json": { title: "Accueil", body: [] },
      "broken.json": "{ not json",
      "notes.txt": "ignored",
    });
    const theme = activeThemeDir(themesDir);
    expect(theme).toMatchObject({ id: "apdm", name: "Au Pied du Morclan" });

    const pages = readThemePages(theme.dir);
    expect(pages.map((p) => p.slug)).toEqual(["broken", "faq", "home"]);
    expect(pages[0].error).toBeTruthy();
    expect(pages[1].page).toEqual({ slug: "faq", title: "FAQ", body: [{ type: "accordion" }] });
  });

  test("no active theme when only the default one is installed", () => {
    const themesDir = fs.mkdtempSync(path.join(os.tmpdir(), "omega-themes-"));
    fs.mkdirSync(path.join(themesDir, "default"));
    expect(activeThemeDir(themesDir)).toBeNull();
  });

  // The real theme this feature was asked for, when its checkout is around.
  const apdm = process.env.APDM_THEME_DIR;
  (apdm && fs.existsSync(apdm) ? test : test.skip)("parses every page of apdm-omega-theme", () => {
    const pages = readThemePages(apdm);
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.filter((p) => p.error)).toEqual([]);
  });
});

describe("importPages", () => {
  beforeEach(() => {
    [findUniqueMock, createMock, updateMock, revalidateMock].forEach((m) => m.mockClear());
    findUniqueMock.mockReset();
  });

  const pages = [
    { slug: "faq", title: "FAQ", body: [{ type: "paragraph" }] },
    { slug: "contact", title: "Contact", body: [] },
  ];

  test("creates missing pages, skips existing ones by default, looks up by slug + locale", async () => {
    findUniqueMock.mockImplementation(async ({ where }) => (where.slug_locale.slug === "faq" ? { id: 7 } : null));

    const results = await importPages(pages);

    expect(findUniqueMock.mock.calls[0][0].where).toEqual({ slug_locale: { slug: "faq", locale: "fr" } });
    expect(results.map((r) => r.status)).toEqual(["skipped", "created"]);
    expect(createMock).toHaveBeenCalledWith({ data: { slug: "contact", locale: "fr", title: "Contact", body: "[]" } });
    expect(updateMock).not.toHaveBeenCalled();
    expect(revalidateMock).toHaveBeenCalledWith([{ slug: "contact", locale: "fr" }]);
  });

  test("replaces title and content of existing pages when asked to overwrite", async () => {
    findUniqueMock.mockResolvedValue({ id: 7 });

    const results = await importPages([pages[0]], { overwrite: true, locale: "en" });

    expect(results[0].status).toBe("updated");
    expect(updateMock).toHaveBeenCalledWith({ where: { id: 7 }, data: { title: "FAQ", body: JSON.stringify([{ type: "paragraph" }]) } });
  });

  test("one failing page doesn't stop the others", async () => {
    findUniqueMock.mockResolvedValue(null);
    createMock.mockRejectedValueOnce(new Error("db down")).mockResolvedValueOnce({});
    jest.spyOn(console, "error").mockImplementation(() => {});

    const results = await importPages(pages);

    expect(results.map((r) => r.status)).toEqual(["failed", "created"]);
    expect(results[0].error).toBe("db down");
  });
});
