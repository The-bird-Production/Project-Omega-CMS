import client from "@prisma/client";
import AddLog from "../../Functions/AddLogs.js";
const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });
const UpdateImage = async (req, res) => {
    try {
        await prisma.image.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: {
                title: req.body.title,
                alt: req.body.alt,
                slug: req.body.slug
            },
        });
        AddLog("UPDATE an image", "Anonymouss", "info");
        return res
            .status(201)
            .json({ code: 201, message: "Image sucessfully updated " });
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default UpdateImage;
