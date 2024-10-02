const { PrismaClient } = require('@prisma/client')
const prisma = PrismaClient()






const CreatePage = async (req,res) => {

    try {

    } catch(e) {
        res.json({code: 500, message: "Internal Server Error " + e })
    }



}