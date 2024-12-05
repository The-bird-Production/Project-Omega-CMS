const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


exports.GetAllUser = async (req,res) => {
    try {
        const data = await prisma.user.findMany()
        const count = await prisma.user.count()
    
        if (!data) {
          return res.status(404).json({ code: 404, message: "Role not found" });
        }
        res.status(200).json({ code: 200,totalItems: count, data: data });
      } catch (error) {
        console.log(error)
        return res
          .status(500)
          .json({ code: 500, message: "Internal Server Error " + error });
      }
    


}