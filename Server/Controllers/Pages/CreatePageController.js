const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()






const CreatePage = async (req,res) => {

    const body = req.body.body 
    const slug = req.body.slug 
    const title = req.body.title


    try {

        await prisma.page.create({
            data : {
                body: body, 
                slug: slug,
                title: title
            }
        })
        res.json({code: 200, message: "Data was successful created"})

    } catch(e) {
        res.json({code: 500, message: "Internal Server Error " + e })
    }



}
module.exports = CreatePage