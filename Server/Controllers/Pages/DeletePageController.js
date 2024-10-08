const {PrismaClient} = require('@prisma/client'); 
const prisma = new PrismaClient()

const DeletePage = async (req,res) => {


    const id = parseInt(req.params.id)
    try {
        await prisma.page.delete({where: {
            id: id,
        }})
        res.json({code: 200, message: "Data was successful deleted"})
    } catch (error) {
        return res.json({code: 500, message : "Internal Server Error " + error})
    }

}
module.exports = DeletePage