const { PrismaClient } = require("@prisma/client");
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient();

const AddLogs = async (req, action, color) => {


  const authHeader = req.headers.authorization;
      const token = authHeader.split(" ")[1];
      const decode = jwt.decode(token);
      const user = decode.username; 

  try {
    await prisma.log.create({
      data: {
        action: action,
        user: user,
        color: color,
      },
    });
    return 
  } catch (e) {
    console.log(e);
    return e;
  }
};

module.exports = AddLogs;
