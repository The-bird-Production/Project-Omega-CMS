const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const AddLogs = async (action, user, color) => {
  try {
    await prisma.log.create({
      data: {
        action: action,
        user: user,
        color: color,
      },
    });
  } catch (e) {
    console.log(e);
    return e;
  }
};

module.exports = AddLogs;
