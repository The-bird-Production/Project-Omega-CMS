import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@omega/db";
import Addlogs from "../../Functions/AddLogs.js";

// Répertoire autorisé
const FINAL_DIR = path.resolve(process.cwd(), "Public/Files");

const CreateFile = async (req: Request, res: Response) => {
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

        // ✅ Construction de chemins sécurisés — tmpPath is exactly what
        // multer itself just wrote to (req.file.path): a directory it was
        // configured with plus a filename it generated internally
        // (crypto.randomBytes(16).toString('hex')), never derived from
        // anything in the request, so there's no untrusted input here to
        // path-traverse with. Rebuilding it from a separately-hardcoded
        // directory constant instead of using this value caused a real
        // regression once already (a wrong directory name silently broke
        // every upload) — don't reintroduce that.
        const tmpPath = req.file.path;
        const finalPath = path.resolve(FINAL_DIR, safeFilename);

        // ✅ Vérifie que le chemin de destination reste bien dans le dossier autorisé
        if (!(finalPath === FINAL_DIR || finalPath.startsWith(FINAL_DIR + path.sep))) {
            return res.status(400).json({ code: 400, message: "Chemin non autorisé." });
        }

        // Déplacement du fichier
        try {
            await fs.rename(tmpPath, finalPath);
        } catch (renameErr) {
            if ((renameErr as NodeJS.ErrnoException).code === "ENOENT") {
                console.error(`Fichier temporaire introuvable pour la création de fichier (déjà déplacé, ou requête annulée avant la fin de l'upload) : ${tmpPath}`);
                return res.status(409).json({
                    code: 409,
                    message: "L'upload a été interrompu ou soumis deux fois — réessayez.",
                });
            }
            throw renameErr;
        }

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
