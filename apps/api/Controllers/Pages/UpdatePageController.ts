import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { revalidateWebPaths } from "../../Functions/RevalidateWeb.js";

const UpdatePage = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
        await prisma.page.update({
            data: {
                title: req.body.title,
                body: req.body.body,
                slug: req.body.slug,
                template: typeof req.body.template === "string" && req.body.template.trim() ? req.body.template.trim() : null,
            }, where: {
                id: id
            }
        });
        // Revalidate both the old and new slug in case the page was renamed.
        await revalidateWebPaths([existing?.slug, req.body.slug]);
        res.json({ code: 200, message: "Data was successful updated" });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error " + error });
    }
};
export default UpdatePage;
