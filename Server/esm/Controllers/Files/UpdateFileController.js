import client from "@prisma/client";
import Addlogs from "../../Functions/AddLogs.js";
const { PrismaClient } = client;
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
        await Addlogs("Update an image", "Anonymous", "primary");
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default UpdateFile;
