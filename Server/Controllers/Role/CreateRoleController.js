const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CreateRole = async (req, res) => {
  try {
    await prisma.role.create({
      data: {
        name: req.body.role_name,
        permissions: req.body.role_permissions,
      },
    });
    return res
      .status(200)
      .json({ code: 200, message: "Role successfully created" });
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error " + e });
  }
};

module.exports = CreateRole;
