const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DeleteRole = async (req, res) => {
  try {
    const int = parseInt(req.params.id)
    await prisma.role.delete({
      where: {
        id: int,
      },
    });
    res.status(200).json({ code: 200, message: "Role deleted sucessfully" });
  } catch (error) {
    console.log(error)
    return res
      .status(200)
      .json({ code: 200, message: "Internal Server Error " + error });
    
  }
};

module.exports = DeleteRole;
