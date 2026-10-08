import { jest } from "@jest/globals";

const findUniqueMock = jest.fn();
const updateMock = jest.fn();
const deleteMock = jest.fn();
const findManyMock = jest.fn();
const countMock = jest.fn();

jest.unstable_mockModule("@omega/db", () => ({
  prisma: {
    article: {
      findUnique: findUniqueMock,
      update: updateMock,
      delete: deleteMock,
      findMany: findManyMock,
      count: countMock,
    },
  },
}));

const { getArticleBySlug, modifyArticle, deleteArticle, searchArticles } = await import(
  "../../Controllers/Article/ArticleController.js"
);

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// A slug is only unique per locale since multilingual content: every
// lookup by slug must go through the (slug, locale) compound key, or
// Prisma rejects the query outright (the "needs at least one of id,
// slug_locale or title_locale" error every article page used to hit).
describe("article lookups by slug", () => {
  beforeEach(() => {
    [findUniqueMock, updateMock, deleteMock, findManyMock, countMock].forEach((m) => m.mockReset());
  });

  test("getArticleBySlug defaults to French and only shows published articles", async () => {
    findUniqueMock.mockResolvedValue({ id: 1 });
    const res = mockRes();

    await getArticleBySlug({ params: { slug: "minedesel" }, query: {} }, res);

    const [{ where }] = findUniqueMock.mock.calls[0];
    expect(where.slug_locale).toEqual({ slug: "minedesel", locale: "fr" });
    expect(where.slug).toBeUndefined();
    expect(where.publishedAt.lte).toBeInstanceOf(Date);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getArticleBySlug uses the requested locale", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = mockRes();

    await getArticleBySlug({ params: { slug: "minedesel" }, query: { locale: "en" } }, res);

    expect(findUniqueMock.mock.calls[0][0].where.slug_locale).toEqual({ slug: "minedesel", locale: "en" });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("modifyArticle updates through the compound key", async () => {
    updateMock.mockResolvedValue({});
    await modifyArticle({ params: { slug: "minedesel" }, query: {}, body: { title: "T" } }, mockRes());

    expect(updateMock.mock.calls[0][0].where).toEqual({ slug_locale: { slug: "minedesel", locale: "fr" } });
  });

  test("deleteArticle deletes by id when given the admin list's numeric id", async () => {
    deleteMock.mockResolvedValue({});
    await deleteArticle({ params: { slug: "12" }, query: {}, body: {} }, mockRes());

    expect(deleteMock.mock.calls[0][0].where).toEqual({ id: 12 });
  });

  test("deleteArticle deletes by slug + locale otherwise", async () => {
    deleteMock.mockResolvedValue({});
    await deleteArticle({ params: { slug: "minedesel" }, query: { locale: "en" }, body: {} }, mockRes());

    expect(deleteMock.mock.calls[0][0].where).toEqual({ slug_locale: { slug: "minedesel", locale: "en" } });
  });

  test("searchArticles filters by locale only when one is given", async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);

    await searchArticles({ query: { locale: "en" } }, mockRes());
    await searchArticles({ query: {} }, mockRes());

    expect(findManyMock.mock.calls[0][0].where.locale).toBe("en");
    expect(findManyMock.mock.calls[1][0].where.locale).toBeUndefined();
  });
});
