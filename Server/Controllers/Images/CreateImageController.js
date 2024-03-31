const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CreateImage = async (req, res) => {
  try {
    if (!req.file || !req.body.slug || !req.body.title || !req.body.alt) {
      return res.status(400).json({ code: 400, message: "Missing fields" });
    }
    //get file extension
    let fileName = req.file.originalname;
    let extension = fileName.split(".").pop();
    await fs.renameSync(
      `${process.cwd()}/Public/tmp/Images/${req.file.fileName}`,
      `${process.cwd()}/Public/Images/${req.file.filename}.${extension}`
    );
    await fs.unlink(`${process.cwd()}/Public/tmp/Images/${req.file.fileName}`);

    await prisma.image.create({
      data: {
        title: req.body.title,
        alt: req.body.alt,
        file: req.file.filename + extension,
        slug: req.body.slug,
      },
    });
    return res
      .status(201)
      .json({ code: "201", message: "Image created sucessfully " });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + e });
  }
};

module.exports = CreateImage;
