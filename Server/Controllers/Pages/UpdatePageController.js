const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const UpdatePage = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.page.update({
      data: {
        title: req.body.title,
        body: req.body.body,
        slug: req.body.slug,
      }, where: {
        id: id
      }
    });
    res.json({code: 200, message: "Data was successful updated"})
  } catch (error) {
    return res.json({ code: 500, message: "Internal Server Error " + error });
  }
};

module.exports = UpdatePage
