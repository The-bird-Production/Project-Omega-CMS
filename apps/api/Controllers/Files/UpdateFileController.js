import { prisma } from "@omega/db";
import Addlogs from "../../Functions/AddLogs.js";
const UpdateFile = async (req, res) => {
    try {
        await prisma.file.update({
            where: {
                id: req.params.id,
            },
            data: {
                name: req.body.name,
            },
        });
        await Addlogs("Update an image", "Anonymous", "primary");
    }
    catch (e) {
        return res
            .status(503)
            .json({ code: 503, message: "Internal Server Error " + e });
    }
};
export default UpdateFile;
