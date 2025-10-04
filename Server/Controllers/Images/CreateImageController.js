import path from "path";
import fs from "fs/promises";
import client from "@prisma/client";

const { PrismaClient } = client;
const prisma = new PrismaClient();

// Dossiers autorisés
const TMP_DIR = path.resolve(process.cwd(), "Public/tmp/Images");
const FINAL_DIR = path.resolve(process.cwd(), "Public/Images");

const CreateImage = async (req, res) => {
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

        // ✅ Construction de chemins sécurisés
        const tmpPath = path.join(TMP_DIR, path.basename(req.file.filename));
        const finalPath = path.join(FINAL_DIR, safeFilename);

        // ✅ Vérifie que le chemin reste bien dans le dossier autorisé
        if (!finalPath.startsWith(FINAL_DIR)) {
            return res.status(400).json({ code: 400, message: "Chemin non autorisé." });
        }

        // ✅ Déplacement du fichier
        await fs.rename(tmpPath, finalPath);

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

export default CreateImage;
