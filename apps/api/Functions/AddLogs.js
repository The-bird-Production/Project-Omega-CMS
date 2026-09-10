import { prisma } from "@omega/db";
import { auth }from "../lib/auth.js";
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
