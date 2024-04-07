const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GetAllStats = async (req, res) => {
  try {
    const data = await prisma.stats_web.findMany({});
    res.status(200).json({ code: 200, data });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" + e });
  }
};

const GetStatsByDate = async (req, res) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  try {
    const data = await prisma.stats_web.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    if (!data.length) {
      return res
        .status(404)
        .json({ code: 404, message: "No Data Found for this period" });
    }
    res.status(200).json({ code: 200, data });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" + e });
  }
};

module.exports = {
  GetAllStats,
  GetStatsByDate,
};
