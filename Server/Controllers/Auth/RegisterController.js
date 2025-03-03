const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const hash = require("../../Functions/hash");
const cuid = require("cuid");

exports.Register = async (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.status(400).json({ code: "400", message: "Missing  parameters" });
    return;
  }
  try {
    await prisma.user.create({
      data: {
        id: cuid(),
        username: req.body.username,
        email: req.body.email,
        password: await hash(req.body.password),
        roleId: 1,
        updatedAt: new Date(),
      },
    });

    res
      .status(201)
      .json({ code: "201", message: "User created successfully!" });
  } catch (error) {
    console.error("🚨 Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
      details: error,
    });
  }
};
