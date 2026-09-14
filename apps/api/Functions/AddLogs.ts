import type { Request, Response, NextFunction } from "express";
import { prisma } from "@omega/db";
import { auth } from "../lib/auth.js";

const AddLogs = (action: string, color: string) => {
    return async function (req: Request, res: Response, next: NextFunction) {
        const session = await auth.api.getSession({ headers: req.headers as any });
        try {
            await prisma.log.create({
                data: {
                    action: action,
                    user: session?.user.name || session?.user.id || "Unknown",
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
