const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()



async function Setup() {
    try {
        await prisma.role.create({
            data: {
                name: 'user',
                permissions: {admin: false}
            }
        })
       await prisma.role.create({
            data: {
                name: 'admin',
                permissions: {admin: true}
            }
        })

        console.log("Sucess Setup ")

    } catch(error) {
        console.log(error)
    }
   

}
Setup()

