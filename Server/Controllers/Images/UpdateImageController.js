const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const UpdateImage = async (req, res) => {
  try {
    await prisma.image.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
      },
    });
    return res
      .status(201)
      .json({ code: 201, message: "Image sucessfully updated " });
  } catch (e) {
    return res
      .status(503)
      .json({ code: 503, message: "Internal Server Error " + e });
  }
};

module.exports = UpdateImage;
