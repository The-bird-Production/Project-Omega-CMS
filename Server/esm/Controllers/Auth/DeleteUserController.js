import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient();
export const Delete = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma.user.delete({ where: { id: id } });
        res.json({ code: 200, message: "User sucessfully deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
