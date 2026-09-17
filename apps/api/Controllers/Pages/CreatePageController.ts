import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const CreatePage = async (req: Request, res: Response) => {
    const body = req.body.body;
    const slug = req.body.slug;
    const title = req.body.title;
    // Name of a theme-provided page template (see apps/web/lib/pageTemplates/README.md), or omitted/null for the normal block rendering.
    const template = typeof req.body.template === "string" && req.body.template.trim() ? req.body.template.trim() : null;
    try {
        await prisma.page.create({
            data: {
                body: body,
                slug: slug,
                title: title,
                template: template
            }
        });
        res.json({ code: 200, message: "Data was successful created" });
    }
    catch (e) {
        res.json({ code: 500, message: "Internal Server Error " + e });
    }
};
export default CreatePage;
