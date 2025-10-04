import {prisma} from "../../lib/prisma.js";

export const getUser = async (req, res) => {
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