import client from "@prisma/client";
import { auth }from "../lib/auth.js";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const AddLogs = (action, color) => {
    return async function (req, res, next) {
        const session = await auth.api.getSession({headers: req.headers});
        try {
            await prisma.log.create({
                data: {
                    action: action,
                    user: session.user.name || session.user.id || "Unknown",
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
