import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const GetAllStats = async (req, res) => {
    try {
        const metrics = await prisma.stats_Api.findMany();
        res.status(200).json({ code: 200, data: metrics });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};
const GetStatsByDate = async (req, res) => {
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    try {
        const metrics = await prisma.stats_Api.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
        });
        if (!metrics.length) {
            res.status(404).json({ code: 404, message: "No Data Found" });
        }
        return res.status(200).json({ code: 200, data: metrics });
    }
    catch (e) {
        return res
            .status(500)
            .json({ code: 500, message: "Internal Server Error " + e });
    }
};
export { GetAllStats };
export { GetStatsByDate };
export default {
    GetAllStats,
    GetStatsByDate
};
