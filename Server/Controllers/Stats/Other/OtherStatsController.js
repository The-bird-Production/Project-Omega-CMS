
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient


exports.GetNumberOfAllUser = async (req, res) => {
    try {

        const number = await prisma.user.count()
       

        res.json({code: 200, data: number})


    }catch(error) {
        res.json({code: 500, message: "Internal Server Error" + error})
    }

}
exports.GetNumberOfAllRole = async (req,res) => {
    try {

        const number = await prisma.role.count()

        res.json({code: 200, data : number})


    }catch(error) {
        res.json({code: 500, message: "Internal Server Error" + error})
    }

}
exports.GetNumberOfAllPage = async (req,res) => {
    try {

        const number = await prisma.page.count()

        res.json({code: 200, data : number})


    }catch(error) {
        res.json({code: 500, message: "Internal Server Error" + error})
    }

}
