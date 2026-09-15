import { jest } from "@jest/globals";
import { fetchCatalog, clearCatalogCache } from "../../Functions/catalog.js";

function mockFetchOnce(response) {
  global.fetch = jest.fn().mockResolvedValue(response);
}

describe("fetchCatalog", () => {
  beforeEach(() => {
    clearCatalogCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns validated entries from the catalog repo", async () => {
    mockFetchOnce({
      status: 200,
      ok: true,
      json: async () => [
        { repo: "owner/plugin-a", name: "Plugin A", description: "Does A things." },
        { repo: "owner/plugin-b", name: "Plugin B", description: "Does B things." },
      ],
    });

    const entries = await fetchCatalog("plugins");

    expect(entries).toEqual([
      { repo: "owner/plugin-a", name: "Plugin A", description: "Does A things." },
      { repo: "owner/plugin-b", name: "Plugin B", description: "Does B things." },
    ]);
  });

  test("filters out malformed entries instead of throwing", async () => {
    mockFetchOnce({
      status: 200,
      ok: true,
      json: async () => [
        { repo: "owner/good", name: "Good", description: "Fine." },
        { repo: "owner/missing-description", name: "Bad" },
        "not-an-object",
        null,
      ],
    });

    const entries = await fetchCatalog("themes");

    expect(entries).toEqual([{ repo: "owner/good", name: "Good", description: "Fine." }]);
  });

  test("returns an empty list when the catalog file doesn't exist yet (404)", async () => {
    mockFetchOnce({ status: 404, ok: false });
    await expect(fetchCatalog("plugins")).resolves.toEqual([]);
  });

  test("throws on a non-ok, non-404 response", async () => {
    mockFetchOnce({ status: 500, ok: false });
    await expect(fetchCatalog("plugins")).rejects.toThrow(/Erreur API GitHub/);
  });

  test("caches results and does not re-fetch within the TTL", async () => {
    mockFetchOnce({
      status: 200,
      ok: true,
      json: async () => [{ repo: "owner/a", name: "A", description: "desc" }],
    });

    await fetchCatalog("plugins");
    await fetchCatalog("plugins");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
