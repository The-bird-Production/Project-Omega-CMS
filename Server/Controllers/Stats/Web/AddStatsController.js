import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const AddStats = async (req, res) => {
    try {
        console.log(req.body);
        await prisma.stats_web.create({
            data: {
                page: req.body.page,
                count: 1,
            },
        });
        return res
            .status(200)
            .json({ code: 200, message: "Sucessfully added to stats" });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal ServerError " + e });
    }
};
export default AddStats;
