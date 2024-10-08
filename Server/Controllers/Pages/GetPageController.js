const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


const GetPage = async (req,res) => {

    const slug = req.params.slug 

    try {

       const data =  await prisma.page.findFirst({where: {slug: slug}})

       res.json({code : 200, data: data})
        
    } catch (error) {
        return res.json({code : 500 , message: "Internal Server Error" + error})
        
    }

}

module.exports = GetPage