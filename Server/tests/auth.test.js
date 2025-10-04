import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("devrait créer un utilisateur et renvoyer un token", async () => {
    const res = await request(app).post("/auth/register/").type("form").send({
      username: "test",
      email: "test@example.com",
      password: "password",
    });

    console.log("📩 Réponse reçue :", res.body);
    expect(res.statusCode).toBe(201);

    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    expect(user).not.toBeNull();
  });
});
