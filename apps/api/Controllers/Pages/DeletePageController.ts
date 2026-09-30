import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { revalidateWebPaths } from "../../Functions/RevalidateWeb.js";

const DeletePage = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
        await prisma.page.delete({ where: {
                id: id,
            } });
        await revalidateWebPaths([existing?.slug]);
        res.json({ code: 200, message: "Data was successful deleted" });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error " + error });
    }
};
export default DeletePage;
