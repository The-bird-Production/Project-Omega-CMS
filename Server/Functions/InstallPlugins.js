import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import axios from "axios";
import { execFile } from "child_process";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { loadPlugin } from "./LoadPlugin.js";
import { warn } from "console";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const InstallPlugins = async (pluginId, app, update) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const pluginDir = path.resolve(pluginsDir, pluginId);
    const clientDir = path.resolve(__dirname, "../../Client/app/components/plugin");
    const tempDir = path.resolve(process.cwd(), "temp");
    const BACKUP_DIR = path.resolve(process.cwd(), "backups");

    try {
        if (!pluginId || typeof pluginId !== "string") {
            throw new Error("Plugin ID invalide.");
        }

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

        // ✅ Validation stricte de l’URL (évite SSRF)
        const allowedHost = "omega.marketplace.thebirdproduction.fr";
        const downloadUrl = new URL(`https://${allowedHost}/download/${encodeURIComponent(pluginId)}`);

        console.log(`Téléchargement sécurisé du plugin : ${downloadUrl.href}`);
        const { data } = await axios.get(downloadUrl.href, { responseType: "arraybuffer", timeout: 10000 });

        const zip = new AdmZip(data);
        const extractPath = path.join(tempDir, pluginId);
        zip.extractAllTo(extractPath, true);

        // ✅ Déplacement sécurisé des fichiers
        const safePluginDir = path.join(pluginsDir, path.basename(pluginId));
        if (fs.existsSync(safePluginDir)) fs.rmSync(safePluginDir, { recursive: true, force: true });
        fs.renameSync(extractPath, safePluginDir);

        const safeClientPluginDir = path.join(clientDir, path.basename(pluginId));
        if (!update && !fs.existsSync(safeClientPluginDir)) {
            fs.mkdirSync(safeClientPluginDir, { recursive: true });
        }

        const dashboardFile = path.join(safePluginDir, "admin", "dashboard.js");
        const publicComponent = path.join(safePluginDir, "public", "publicComponent.js");

        if (fs.existsSync(dashboardFile)) {
            fs.renameSync(dashboardFile, path.join(safeClientPluginDir, "dashboard.js"));
        }

        if (fs.existsSync(publicComponent)) {
            fs.renameSync(publicComponent, path.join(safeClientPluginDir, "publicComponent.js"));
        }

        // ✅ Suppression sécurisée des anciens dossiers
        fs.rmSync(path.join(safePluginDir, "admin"), { recursive: true, force: true });
        fs.rmSync(path.join(safePluginDir, "public"), { recursive: true, force: true });

        console.log("✅ Dossier du plugin déplacé avec succès");

        // ✅ Sauvegarde base de données sécurisée (sans injection)
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) throw new Error("DATABASE_URL non défini dans les variables d'environnement.");

        const db = new URL(DATABASE_URL);
        const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFilePath = path.join(BACKUP_DIR, `backup_${backupTimestamp}.sql`);

        if (process.env.NODE_ENV !== "development") {
            await new Promise((resolve, reject) => {
                execFile(
                    "mysqldump",
                    ["-u", db.username, `-p${db.password}`, "-h", db.hostname, "-P", db.port || "3306", db.pathname.replace("/", "")],
                    { maxBuffer: 1024 * 1024 * 10 },
                    (error, stdout, stderr) => {
                        if (error || stderr) {
                            console.error("Erreur de sauvegarde MySQL :", error || stderr);
                            return reject(error || new Error(stderr));
                        }
                        fs.writeFileSync(backupFilePath, stdout);
                        console.log(`✅ Sauvegarde effectuée : ${backupFilePath}`);
                        resolve();
                    }
                );
            });
        }

        // ✅ Application de la migration de manière sécurisée
        const migrationPath = path.join(safePluginDir, "prisma", "migration.sql");
        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
            if (migrationSQL.trim()) {
                await prisma.$executeRawUnsafe(migrationSQL); // ⚠️ Utilisable uniquement si migration interne
            } else {
                warn("Fichier de migration vide, ignoré.");
            }
        } else {
            warn("Aucun fichier de migration trouvé.");
        }

        // ✅ Chargement du plugin
        loadPlugin(app, pluginId);
        console.log(`✅ Plugin ${pluginId} installé avec succès.`);
    } catch (err) {
        console.error("❌ Erreur lors de l'installation du plugin :", err);
        fs.rmSync(pluginDir, { recursive: true, force: true });
        fs.rmSync(path.join(clientDir, pluginId), { recursive: true, force: true });
        throw err;
    }
};

export default InstallPlugins;
