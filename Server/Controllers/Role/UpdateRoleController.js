const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UpdateRole = async (req, res) => {
  try {
    await prisma.role.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.role_name,
        permissions: req.body.role_permissions,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + e });
  }
};

module.exports = UpdateRole;
