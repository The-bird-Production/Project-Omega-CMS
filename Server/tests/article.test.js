const request = require("supertest");
const app = require("../app");
const { prisma } = require("../lib/prisma");

describe("Article API", () => {
  beforeAll(async () => {
    await prisma.article.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("devrait créer un article", async () => {
    const res = await request(app)
      .post("/article/create/")
      .type("form")
      .send({
        title: "test",
        slug: "slug",
        body: "Test",
        publishedAt: new Date("2025-01-01"),
      });

    expect(res.statusCode).toBe(201);

    const user = await prisma.article.findUnique({
      where: { slug: "slug" },
    });
    expect(user).not.toBeNull();
  });
  it("devrait récupérer un article", async () => {
    const res = await request(app).get("/article/slug/");

    expect(res.statusCode).toBe(200);
  });
  it("devrait récupérer tous les articles", async () => {
    const res = await request(app).get("/article/all/");
    expect(res.statusCode).toBe(200);
  });
  it("devrait mettre à jour un article", async () => {
    const res = await request(app)
      .put("/article/update/")
      .type("form")
      .send({
        title: "test",
        slug: "slug",
        body: "Test",
        publishedAt: new Date("2025-01-01"),
      });
    expect(res.statusCode).toBe(200);
  });
  it("devrait supprimer un article", async () => {
    const res = await request(app).delete("/article/delete/slug");
    expect(res.statusCode).toBe(200);
  });
});
