import { jest } from "@jest/globals";

const createMock = jest.fn();

jest.unstable_mockModule("@omega/db", () => ({
  prisma: { stats_web: { create: createMock } },
}));

const { default: AddStats } = await import("../../Controllers/Stats/Web/AddStatsController.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36";

describe("AddStats", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({});
  });

  test("stores visitorId, referrer and the parsed device/browser", async () => {
    const req = {
      body: { page: "/blog/hello", visitorId: "abc-123", referrer: "google.com", userAgent: CHROME_UA },
    };
    const res = mockRes();

    await AddStats(req, res);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        page: "/blog/hello",
        count: 1,
        visitorId: "abc-123",
        referrer: "google.com",
        device: "Ordinateur",
        browser: "Chrome",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("omits visitorId/referrer when not provided, but still records device/browser", async () => {
    const req = { body: { page: "/", userAgent: CHROME_UA } };
    const res = mockRes();

    await AddStats(req, res);

    const [{ data }] = createMock.mock.calls[0];
    expect(data.visitorId).toBeUndefined();
    expect(data.referrer).toBeUndefined();
    expect(data.device).toBe("Ordinateur");
    expect(data.browser).toBe("Chrome");
  });

  test("still rejects a missing page as before", async () => {
    const req = { body: { visitorId: "abc-123" } };
    const res = mockRes();

    await AddStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});
