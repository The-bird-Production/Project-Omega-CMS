import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(undefined, { log: ["query"] });
import compare from "../../Functions/compare"

exports.Login = async (req,res) => {


    const {email, password} = req.body; 
    if(!email || !password){

        res.json(401).json({code:"401",message:"Missing email or password"})
    }

    const user = await prisma.user.findFirst({where:{email}})
    
    if (!user) return res .status(403).send("Invalid  credentials");

    const validPassword = await compare(user.password , password);
  
    if (!validPassword ) return res.status(403).send(' Invalid Password');

    //SEND JWT 

    








}