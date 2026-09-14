import type { Request, Response } from "express";
import { prisma } from "@omega/db";

export const GetNumberOfAllUser = async (req: Request, res: Response) => {
    try {
        const number = await prisma.user.count();
        res.json({ code: 200, data: number });
    }
    catch (error) {
        res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
export const GetNumberOfAllPage = async (req: Request, res: Response) => {
    try {
        const number = await prisma.page.count();
        res.json({ code: 200, data: number });
    }
    catch (error) {
        res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
