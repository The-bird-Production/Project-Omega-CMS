import { jest } from "@jest/globals";

const findManyMock = jest.fn();
const countMock = jest.fn();

jest.unstable_mockModule("@omega/db", () => ({
  prisma: {
    article: {
      findMany: findManyMock,
      count: countMock,
    },
  },
}));

const { searchArticles, getArticleCategories, getArticleTags } = await import(
  "../../Controllers/Article/ArticleController.js"
);

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("searchArticles", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    countMock.mockReset();
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);
  });

  test("defaults to page 1 / pageSize 10 and only shows published articles", async () => {
    const res = mockRes();
    await searchArticles({ query: {} }, res);

    const [args] = findManyMock.mock.calls[0];
    expect(args.where.publishedAt.lte).toBeInstanceOf(Date);
    expect(args.skip).toBe(0);
    expect(args.take).toBe(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
    );
  });

  test("clamps pageSize to 50 and computes the correct offset", async () => {
    const res = mockRes();
    await searchArticles({ query: { page: "3", pageSize: "500" } }, res);

    const [args] = findManyMock.mock.calls[0];
    expect(args.take).toBe(50);
    expect(args.skip).toBe(100); // (page 3 - 1) * pageSize 50
  });

  test("filters by category and tag, and searches title/body for q", async () => {
    const res = mockRes();
    await searchArticles({ query: { q: "hello", category: "news", tag: "tech" } }, res);

    const [args] = findManyMock.mock.calls[0];
    expect(args.where.category).toBe("news");
    expect(args.where.tags).toEqual({ contains: "tech" });
    expect(args.where.OR).toEqual([
      { title: { contains: "hello" } },
      { body: { contains: "hello" } },
    ]);
  });

  test("responds 500 if the database query throws", async () => {
    findManyMock.mockRejectedValue(new Error("boom"));
    const res = mockRes();

    await searchArticles({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getArticleCategories", () => {
  test("returns the sorted, deduplicated category list", async () => {
    findManyMock.mockResolvedValue([{ category: "tech" }, { category: "news" }]);
    const res = mockRes();

    await getArticleCategories({}, res);

    expect(res.json).toHaveBeenCalledWith({ data: ["news", "tech"] });
  });
});

describe("getArticleTags", () => {
  test("splits comma-separated tags across articles, deduplicates and sorts them", async () => {
    findManyMock.mockResolvedValue([{ tags: "tech, ai" }, { tags: "news,tech" }]);
    const res = mockRes();

    await getArticleTags({}, res);

    expect(res.json).toHaveBeenCalledWith({ data: ["ai", "news", "tech"] });
  });
});
