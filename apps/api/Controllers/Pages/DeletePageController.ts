import type { Request, Response } from "express";
import { prisma } from "@omega/db";

const DeletePage = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.page.delete({ where: {
                id: id,
            } });
        res.json({ code: 200, message: "Data was successful deleted" });
    }
    catch (error) {
        return res.json({ code: 500, message: "Internal Server Error " + error });
    }
};
export default DeletePage;
