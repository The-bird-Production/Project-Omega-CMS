import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const GetPage = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const locale = typeof req.query.locale === "string" && req.query.locale.trim() ? req.query.locale.trim() : "fr";
    try {
        const data = await prisma.page.findUnique({ where: { slug_locale: { slug, locale } } });
        res.json({ code: 200, data: data });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
export default GetPage;
