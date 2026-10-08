import { jest } from "@jest/globals";

const importArticlesMock = jest.fn();

jest.unstable_mockModule("../../lib/articleImport.js", () => ({
  importArticles: importArticlesMock,
  normalizeSourceUrl: (s) => {
    const url = new URL(s);
    if (!/^https?:$/.test(url.protocol)) throw new Error("bad");
    return s;
  },
}));

const { importArticlesFromSite } = await import("../../Controllers/Article/ImportController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(body) {
  return { body, session: { user: { id: "admin-1" } }, protocol: "http", get: () => "localhost:3001" };
}

describe("importArticlesFromSite", () => {
  beforeEach(() => importArticlesMock.mockReset());

  test("rejects a missing or non-http source without importing anything", async () => {
    for (const source of [undefined, "pas une url", "ftp://x"]) {
      const res = mockRes();
      await importArticlesFromSite(mockReq({ source }), res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(importArticlesMock).not.toHaveBeenCalled();
  });

  test("imports as the logged-in admin and returns the report", async () => {
    const report = { imported: 2 };
    importArticlesMock.mockResolvedValue(report);
    const res = mockRes();

    await importArticlesFromSite(mockReq({ source: "https://old.example", dryRun: true }), res);

    expect(importArticlesMock).toHaveBeenCalledWith(
      expect.objectContaining({ source: "https://old.example", dryRun: true, authorId: "admin-1" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(report);
  });

  test("reports a source that can't be reached as a 502 with its reason", async () => {
    importArticlesMock.mockRejectedValue(new Error("fetch failed"));
    const res = mockRes();
    jest.spyOn(console, "error").mockImplementation(() => {});

    await importArticlesFromSite(mockReq({ source: "https://old.example" }), res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json.mock.calls[0][0].message).toContain("fetch failed");
  });
});
