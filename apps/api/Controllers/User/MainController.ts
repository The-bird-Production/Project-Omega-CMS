import type { Request, Response } from "express";
import { prisma } from "@omega/db";

export const getUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const data = await prisma.user.findUnique({
            where: {
                id: id
            }
        })

        return res.status(200).json(data)

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}
