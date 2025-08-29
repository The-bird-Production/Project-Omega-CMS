import fs from "fs/promises";
import client from "@prisma/client";
import Addlogs from "../../Functions/AddLogs.js";
const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });
const CreateFile = async (req, res) => {
    let format = req.file.mimetype; //getting the file type
    if (!format == "image/jpeg" || !format == "image/png") {
        return res.status(400).json({
            code: 400,
            message: "Bad request please select other method  to upload your image.",
        });
    }
    let originalFileName = req.file.originalname;
    let extension = originalFileName.split(".").pop(); // getting the file extension
    try {
        await fs.rename(`${process.cwd()}/Public/tmp/Files/${req.file.filename}`, `${process.cwd()}/Public/Files/${req.file.filename}.${extension}`);
        await prisma.file.create({
            data: {
                filename: req.file.filename + "." + extension,
                slug: req.body.slug,
                name: req.body.name,
            },
        });
        await Addlogs("Create an image", "Anonymous", "sucess");
        return res
            .status(201)
            .json({ code: 201, message: "Created Successfully!" });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};
export default CreateFile;
