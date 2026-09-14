import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const GetAllPage = async (req: Request, res: Response) => {
    try {
        const data = await prisma.page.findMany();
        if (!data) {
            return res.json({ code: 404, message: "Pages not found" });
        }
        return res.json({ code: 200, data: data });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal server Error :" + error });
    }
};
export { GetAllPage };
