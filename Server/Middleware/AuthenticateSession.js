//Used for authenticate Session

const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const AuthenticateSession = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV == "development") {
    next();
    return;
  }

  if (!authHeader) {
    res.status(401).json({ code: 401, message: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const data = jwt.decode(token);
    const user = await prisma.user.findFirst({
      where: { email: req.session.email },
    });

    if (user.id == data.id) {
      next();
    } else {
      res.status(403).json({
        code: 403,
        message: "Your token are not valid and doesn't match with your data",
      });
    }
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ code: 500, message: "Internal serveur error : " + e });
  }
};
module.exports = AuthenticateSession;
