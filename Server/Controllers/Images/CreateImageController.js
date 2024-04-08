const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const fs = require("fs/promises");
const AddLog = require("../../Functions/AddLogs");

const CreateImage = async (req, res) => {
  try {
    console.log(req.file);
    if (!req.body.slug || !req.body.title || !req.body.alt) {
      return res.status(400).json({
        code: 400,
        message: "Missing fields current fields : " + JSON.stringify(req.body),
      });
    }
    //get file extension
    let orignalFileName = req.file.originalname;
    let extension = orignalFileName.split(".").pop();
    await fs.rename(
      `${process.cwd()}/Public/tmp/Images/${req.file.filename}`,
      `${process.cwd()}/Public/Images/${req.file.filename}.${extension}`
    );

    await prisma.image.create({
      data: {
        title: req.body.title,
        alt: req.body.alt,
        file: req.file.filename + "." + extension,
        slug: req.body.slug,
      },
    });
    AddLog("Create an image", "Annonymouss", "sucess");
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
