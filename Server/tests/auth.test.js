const request = require("supertest");
const app = require("../server");
const {prisma} = require("../lib/prisma");


describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany(); // Nettoie la base avant chaque test
  });

  it("devrait créer un utilisateur et renvoyer un token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");

    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });
    expect(user).not.toBeNull();
  });

 
});
