import client from "@prisma/client";
import * as config from "../../config/server.js";
const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });
const GetFile = async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { slug: req.params.slug },
        });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json({
            code: 200,
            data: {
                filname: file.name,
                path: config.URL + "/file/" + file.filename,
            },
        });
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server error " + e });
    }
};
export default GetFile;
