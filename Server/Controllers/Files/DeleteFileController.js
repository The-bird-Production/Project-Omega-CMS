import fs from "fs/promises";
import client from "@prisma/client";
import Addlogs from "../../Functions/AddLogs.js";
const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });
const DeleteFile = async (req, res) => {
    try {
        const file = await prisma.file.findUnique({ where: { id: req.params.id } });
        if (!file) {
            return res.status(404).json({
                code: 404,
                message: "The File with the given ID was not found.",
            });
        }
        await fs.unlink(process.cwd() + "/Public/Files/" + file.filename);
        await prisma.file.delete({ where: { id: req.params.id } });
        await Addlogs("Delete an image", "Anonymous", "danger");
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 500, message: "Internal Serveur Error " + e });
    }
};
export default DeleteFile;
