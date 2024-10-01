const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UpdateRole = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.role.update({
      where: {
        id: id,
      },
      data: {
        name: req.body.role_name,
        permissions: req.body.role_permissions,
      },
    });
    res.json({ code: "201",message: "Role updated successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + e });
  }
};

module.exports = UpdateRole;
