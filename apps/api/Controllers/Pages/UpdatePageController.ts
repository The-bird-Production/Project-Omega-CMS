import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const UpdatePage = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
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
        res.json({ code: 200, message: "Data was successful updated" });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error " + error });
    }
};
export default UpdatePage;
