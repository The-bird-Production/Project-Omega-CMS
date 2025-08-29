import client from "@prisma/client";
import jwt from "jsonwebtoken";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const AddLogs = (action, color) => {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const decode = jwt.decode(token);
        const user = decode.user.name;
        try {
            await prisma.log.create({
                data: {
                    action: action,
                    user: user,
                    color: color,
                },
            });
            next();
        }
        catch (e) {
            console.log(e);
            return e;
        }
    };
};
export default AddLogs;
