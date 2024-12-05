const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.GetUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });

    res.json({ code: 200, data: user });
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
  } catch (err) {
    res.json({ code: 500, message: "Internal server Error" + err });
  }
};
