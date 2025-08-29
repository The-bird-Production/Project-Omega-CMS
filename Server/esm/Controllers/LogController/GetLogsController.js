import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const GetLogs = async (req, res) => {
    let startId = parseInt(req.query.startId);
    let endId = parseInt(req.query.endId);
    try {
        const logs = await prisma.log.findMany({
            where: {
                id: {
                    gte: startId || 1,
                    lte: endId || 50,
                },
            }, orderBy: {
                id: 'desc'
            }
        });
        const totalItems = await prisma.log.count();
        return res.status(200).json({ code: 200, totalItems: totalItems, data: logs });
    }
    catch (e) {
        console.log("Error: ", e);
        res.status(500).json({ code: 500, message: "Internal Server Error " + e });
    }
};
export default GetLogs;
