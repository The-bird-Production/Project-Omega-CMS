import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient;
export const GetNumberOfAllUser = async (req, res) => {
    try {
        const number = await prisma.user.count();
        res.json({ code: 200, data: number });
    }
    catch (error) {
        res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
export const GetNumberOfAllRole = async (req, res) => {
    try {
        const number = await prisma.role.count();
        res.json({ code: 200, data: number });
    }
    catch (error) {
        res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
export const GetNumberOfAllPage = async (req, res) => {
    try {
        const number = await prisma.page.count();
        res.json({ code: 200, data: number });
    }
    catch (error) {
        res.json({ code: 500, message: "Internal Server Error" + error });
    }
};
