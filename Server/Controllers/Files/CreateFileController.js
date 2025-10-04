import fs from "fs/promises";
import path from "path";
import client from "@prisma/client";
import Addlogs from "../../Functions/AddLogs.js";

const { PrismaClient } = client;
const prisma = new PrismaClient(undefined, { log: ["query"] });

// Répertoires sûrs
const TMP_DIR = path.resolve(process.cwd(), "Public/tmp/Files");
const FINAL_DIR = path.resolve(process.cwd(), "Public/Files");

const CreateFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ code: 400, message: "Aucun fichier reçu." });
        }

        const format = req.file.mimetype;
        const allowedFormats = ["image/jpeg", "image/png"];

        // ✅ Vérification correcte du type MIME
        if (!allowedFormats.includes(format)) {
            return res.status(400).json({
                code: 400,
                message: "Format de fichier non autorisé.",
            });
        }

        // ✅ Nettoyage du nom de fichier
        const originalFileName = path.basename(req.file.originalname);
        const extension = path.extname(originalFileName).toLowerCase() || "";
        const safeFilename = path.basename(req.file.filename) + extension;

        // ✅ Construction de chemins sécurisés
        const tmpPath = path.join(TMP_DIR, path.basename(req.file.filename));
        const finalPath = path.join(FINAL_DIR, safeFilename);

        // ✅ Vérifie que le chemin reste bien dans le dossier autorisé
        if (!finalPath.startsWith(FINAL_DIR)) {
            return res.status(400).json({ code: 400, message: "Chemin non autorisé." });
        }

        // Déplacement du fichier
        await fs.rename(tmpPath, finalPath);

        // Enregistrement en base de données
        await prisma.file.create({
            data: {
                filename: safeFilename,
                slug: req.body.slug || null,
                name: req.body.name || originalFileName,
            },
        });

        Addlogs("Create a file", "success");

        return res.status(201).json({
            code: 201,
            message: "Created successfully!",
        });

    } catch (e) {
        console.error("Error creating file:", e);
        return res.status(500).json({
            code: 500,
            message: "Internal Server Error.",
        });
    }
};

export default CreateFile;
