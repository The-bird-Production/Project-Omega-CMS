import { jest } from "@jest/globals";

const findUniqueMock = jest.fn();
const upsertMock = jest.fn();

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { appSettings: { findUnique: findUniqueMock, upsert: upsertMock } },
}));

const { getSite, updateSite } = await import("../../Controllers/System/SiteController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("getSite", () => {
  test("returns null when no name was ever set", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = mockRes();
    await getSite({}, res);
    expect(res.json).toHaveBeenCalledWith({ siteName: null });
  });

  test("returns the saved name", async () => {
    findUniqueMock.mockResolvedValue({ siteName: "Mon site" });
    const res = mockRes();
    await getSite({}, res);
    expect(res.json).toHaveBeenCalledWith({ siteName: "Mon site" });
  });
});

describe("updateSite", () => {
  beforeEach(() => {
    upsertMock.mockReset();
    upsertMock.mockImplementation(async ({ update }) => ({ siteName: update.siteName }));
  });

  test("trims and collapses whitespace before saving", async () => {
    const res = mockRes();
    await updateSite({ body: { siteName: "  Mon   site  " } }, res);
    expect(upsertMock.mock.calls[0][0].update).toEqual({ siteName: "Mon site" });
    expect(res.json).toHaveBeenCalledWith({ siteName: "Mon site" });
  });

  test("an empty name resets to the default (null)", async () => {
    await updateSite({ body: { siteName: "   " } }, mockRes());
    expect(upsertMock.mock.calls[0][0].update).toEqual({ siteName: null });
  });

  test("rejects a non-string or overly long name without saving", async () => {
    for (const siteName of [42, "x".repeat(121)]) {
      const res = mockRes();
      await updateSite({ body: { siteName } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
