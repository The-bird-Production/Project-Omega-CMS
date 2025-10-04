import client from "@prisma/client";
import * as config from "../../config/server.js";
const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });
const GetImage = async (req, res) => {
    try {
        if (req.params.slug === "all") {
            const files = await prisma.image.findMany();
            return res.status(200).json({
                code: 200,
                data: {
                    files: files,
                },
            });
        }
        const file = await prisma.image.findUnique({
            where: { slug: req.params.slug },
        });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json({
            code: 200,
            data: {
                id: file.id,
                title: file.title,
                alt: file.alt,
                slug: file.slug,
                path: config.URL + "/image/" + file.file,
            },
        });
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server error " + e });
    }
};
export default GetImage;
