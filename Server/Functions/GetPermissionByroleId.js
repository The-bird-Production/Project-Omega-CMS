import client from "@prisma/client";
const { PrismaClient } = client;
const prisma = new PrismaClient();
const GetPermissionByRoleId = async (roleId) => {
    try {
        const data = await prisma.role.findFirst({
            where: { id: roleId },
            select: { permissions: true },
        });
        return data;
    }
    catch (e) {
        return e;
    }
};
export default GetPermissionByRoleId;
