const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GetRole = async (req, res) => {
  try {
    const data = await prisma.role.findFirst({
      where: {
        id: req.params.id,
      },
    });

    if (!data) {
      return res.status(404).json({ code: 404, message: "Role not found" });
    }
    res.status(200).json({ code: 200, data: data });
  } catch (error) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + e });
  }
};

module.exports = GetRole;
