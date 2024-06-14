const fs = require("fs/promises");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });
const AddLog = require("../../Functions/AddLogs");

const DeleteImage = async (req, res) => {
  try {
    const int = parseInt(req.params.id)
    console.log(int)
    const file = await prisma.image.findUnique({ where: { id: int } });

    if (!file) {
      return res.status(404).json({
        code: 404,
        message: "The File with the given ID was not found.",
      });
    }

    await fs.unlink(process.cwd() + "/Public/Images/" + file.file);

    await prisma.image.delete({ where: { id: int } });
    AddLog("Delete an image", "Anonymouss", "danger");
    return res
      .status(200)
      .json({ code: 200, message: "Successfully deleted." });
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ code: 500, message: "Internal Serveur Error " + e });
  }
};

module.exports = DeleteImage;
