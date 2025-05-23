const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const compare = require("../../Functions/compare");
const jwt = require("jsonwebtoken");
const config = require("../../config/session");

exports.Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401).json({ code: "401", message: "Missing email or password" });
    return;
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      res
        .status(403)
        .json({ code: "403", message: "Invalid email or password" });
      return;
    }

    const validPassword = await compare(user.password, password);
    if (!validPassword) {
      res
        .status(403)
        .json({ code: "403", message: "Invalid email or password" });
      return;
    }

    let data = {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      email: user.email,
      image: user.image,
    };

    res.status(200).json({
      code: "200",
      message: "Success",
      user: data,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({
      code: "500",
      message: "Internal Server Error",
    });
  }
};
