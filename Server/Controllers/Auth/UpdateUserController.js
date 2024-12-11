const {PrismaClient} = require('@prisma/client')
 const prisma = new PrismaClient()

exports.Update = async (req,res) => {

    const id = req.params.id


    try {
        console.log(req.body)
        await prisma.user.update({where: {id: id}, data: req.body})
        
        res.json({code: 200, message: "User successfully updated"})
    } catch(error) {
        res.json({code : 500, message: "Internal Server Error" + error})
    }


}