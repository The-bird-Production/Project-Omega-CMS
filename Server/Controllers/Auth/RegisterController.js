const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(undefined, { log: ["query"] });

const hash = require('../../Functions/hash');

exports.Register = async (req,res) => {
    
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.status(400).json({code:"400", message:"Missing  parameters"});
        return;
    }
    try {
        await prisma.user.create({data: {
            username: req.body.username,
            email: req.body.email,
            password: await hash(req.body.password),
            roleId : 1
        }})
       
        res.status(201).json({code:"201",message:"User created successfully!"});

    } catch(e) {
        console.log(e)
        res.status(500).json({"code": 500, "message": "Internal Server Error " + e })
    }

    


}