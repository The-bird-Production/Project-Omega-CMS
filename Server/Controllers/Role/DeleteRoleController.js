const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DeleteRole = async (req, res) => {
  try {
    await prisma.role.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ code: 200, message: "Role deleted sucessfully" });
  } catch (error) {
    return res
      .status(200)
      .json({ code: 200, message: "Internal Server Error " + e });
  }
};

module.exports = DeleteRole;
