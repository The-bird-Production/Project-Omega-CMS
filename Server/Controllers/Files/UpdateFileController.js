const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const UpdateFile = async (req, res) => {
  try {
    await prisma.file.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.name,
      },
    });
  } catch (e) {
    return res
      .status(503)
      .json({ code: 503, message: "Internal Server Error " + e });
  }
};

module.exports = UpdateFile;
