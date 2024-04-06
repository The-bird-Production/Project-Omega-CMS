const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DeleteLogs = async (req, res) => {
  let startId = parseInt(req.query.startId);
  let endId = parseInt(req.query.endId);
  try {
    await prisma.log.deleteMany({
      where: {
        id: {
          gte: startId || 0,
          lte: endId || 0,
        },
      },
    });
    return res.status(200).json({ code: 200, message: "Sucessfully delete" });
  } catch (e) {
    console.log("Error" + e);
    return res
      .status(503)
      .json({ code: 503, message: "Internal Server Error " + e });
  }
};
module.exports = DeleteLogs;
