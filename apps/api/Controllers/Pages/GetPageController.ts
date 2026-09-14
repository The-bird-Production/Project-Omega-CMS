import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const GetPage = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    try {
        const data = await prisma.page.findFirst({ where: { slug: slug } });
        res.json({ code: 200, data: data });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
export default GetPage;
