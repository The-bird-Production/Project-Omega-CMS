import { jest } from "@jest/globals";

const readdirSyncMock = jest.fn();

jest.unstable_mockModule("fs", () => ({
  default: { existsSync: () => true, readdirSync: readdirSyncMock },
}));

const { GetFavicon } = await import("../../Controllers/Favicon/FaviconController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = { protocol: "https", get: () => "api.example.fr" };

describe("GetFavicon", () => {
  const savedBackendUrl = process.env.BACKEND_URL;
  afterEach(() => {
    if (savedBackendUrl === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = savedBackendUrl;
  });

  test("falls back to the request's own host when BACKEND_URL isn't set (never 'undefined/...')", async () => {
    delete process.env.BACKEND_URL;
    readdirSyncMock.mockReturnValue(["favicon.png"]);
    const res = mockRes();

    await GetFavicon(req, res);

    expect(res.json).toHaveBeenCalledWith({ url: "https://api.example.fr/favicon/favicon.png", file: "favicon.png" });
  });

  test("uses BACKEND_URL when set", async () => {
    process.env.BACKEND_URL = "https://backend.example.fr";
    readdirSyncMock.mockReturnValue(["favicon.ico"]);
    const res = mockRes();

    await GetFavicon(req, res);

    expect(res.json.mock.calls[0][0].url).toBe("https://backend.example.fr/favicon/favicon.ico");
  });

  test("reports no favicon when none was uploaded", async () => {
    readdirSyncMock.mockReturnValue([]);
    const res = mockRes();

    await GetFavicon(req, res);

    expect(res.json).toHaveBeenCalledWith({ url: null, file: null });
  });
});
