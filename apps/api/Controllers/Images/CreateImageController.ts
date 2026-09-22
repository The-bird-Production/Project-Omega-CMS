import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@omega/db";

// Dossier autorisé
const FINAL_DIR = path.resolve(process.cwd(), "Public/Images");

const CreateImage = async (req: Request, res: Response) => {
    try {
        // Vérification des champs obligatoires
        if (!req.body.slug || !req.body.title || !req.body.alt) {
            return res.status(400).json({
                code: 400,
                message: "Champs manquants : " + JSON.stringify(req.body),
            });
        }

        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: "Aucun fichier reçu.",
            });
        }

        // ✅ Vérification du type MIME autorisé
        const allowedFormats = ["image/jpeg", "image/png"];
        if (!allowedFormats.includes(req.file.mimetype)) {
            return res.status(400).json({
                code: 400,
                message: "Format d'image non autorisé.",
            });
        }

        // ✅ Nettoyage du nom de fichier
        const originalFileName = path.basename(req.file.originalname);
        const extension = path.extname(originalFileName).toLowerCase() || "";
        const safeFilename = path.basename(req.file.filename) + extension;

        // ✅ Construction de chemins sécurisés — tmpPath is exactly what
        // multer itself just wrote to (req.file.path): a directory it was
        // configured with plus a filename IT generated internally
        // (crypto.randomBytes(16).toString('hex'), see multer's disk
        // storage engine), never derived from anything in the request, so
        // there's no untrusted input here to path-traverse with. Rebuilding
        // it from a separately-hardcoded directory constant instead of
        // using this value caused a real regression once already (a typo'd
        // directory name silently broke every upload) — don't reintroduce
        // that.
        const tmpPath = req.file.path;
        const finalPath = path.resolve(FINAL_DIR, safeFilename);

        // ✅ Vérifie que le chemin de destination reste bien dans le dossier autorisé
        if (finalPath !== FINAL_DIR && !finalPath.startsWith(FINAL_DIR + path.sep)) {
            return res.status(400).json({ code: 400, message: "Chemin non autorisé." });
        }

        // ✅ Déplacement du fichier
        try {
            await fs.rename(tmpPath, finalPath);
        } catch (renameErr) {
            if ((renameErr as NodeJS.ErrnoException).code === "ENOENT") {
                console.error(`Fichier temporaire introuvable pour la création d'image (déjà déplacé, ou requête annulée avant la fin de l'upload) : ${tmpPath}`);
                return res.status(409).json({
                    code: 409,
                    message: "L'upload a été interrompu ou soumis deux fois — réessayez.",
                });
            }
            throw renameErr;
        }

        // ✅ Enregistrement en base de données
        await prisma.image.create({
            data: {
                title: req.body.title,
                alt: req.body.alt,
                file: safeFilename,
                slug: req.body.slug,
            },
        });

        return res.status(201).json({
            code: 201,
            message: "Image créée avec succès.",
        });
    } catch (e) {
        console.error("Erreur CreateImage:", e);
        return res.status(500).json({
            code: 500,
            message: "Erreur interne du serveur.",
        });
    }
};

const CreateArticleImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: "Aucun fichier reçu.",
            });
        }

        // ✅ Vérification du type MIME autorisé
        const allowedFormats = ["image/jpeg", "image/png"];
        if (!allowedFormats.includes(req.file.mimetype)) {
            return res.status(400).json({
                code: 400,
                message: "Format d'image non autorisé.",
            });
        }

        // ✅ Nettoyage du nom de fichier
        const originalFileName = path.basename(req.file.originalname);
        const extension = path.extname(originalFileName).toLowerCase() || "";
        const safeFilename = path.basename(req.file.filename) + extension;

        // ✅ Construction de chemins sécurisés — tmpPath is exactly what
        // multer itself just wrote to (req.file.path): a directory it was
        // configured with plus a filename it generated internally, never
        // derived from anything in the request. See CreateImage above.
        const tmpPath = req.file.path;
        const finalPath = path.resolve(FINAL_DIR, safeFilename);

        // ✅ Vérifie que le chemin reste bien dans le dossier autorisé
        if (finalPath !== FINAL_DIR && !finalPath.startsWith(FINAL_DIR + path.sep)) {
            return res.status(400).json({ code: 400, message: "Chemin non autorisé." });
        }

        // ✅ Déplacement du fichier
        try {
            await fs.rename(tmpPath, finalPath);
        } catch (renameErr) {
            if ((renameErr as NodeJS.ErrnoException).code === "ENOENT") {
                console.error(`Fichier temporaire introuvable pour la création d'image (déjà déplacé, ou requête annulée avant la fin de l'upload) : ${tmpPath}`);
                return res.status(409).json({
                    code: 409,
                    message: "L'upload a été interrompu ou soumis deux fois — réessayez.",
                });
            }
            throw renameErr;
        }

        // ✅ Enregistrement en base de données
        await prisma.image.create({
            data: {
                title: "BlogUploadedImage",
                alt: "BlogUploadedImage",
                file: safeFilename,
                slug: safeFilename,
            },
        });

        return res.status(201).json({
            code: 201,
            message: "Image créée avec succès.",
            url: `${process.env.BACKEND_URL}/image/${safeFilename}`,
        });
    } catch (e) {
        console.error("Erreur CreateImage:", e);
        return res.status(500).json({
            code: 500,
            message: "Erreur interne du serveur.",
        });
    }

}


export default { CreateImage, CreateArticleImage };
