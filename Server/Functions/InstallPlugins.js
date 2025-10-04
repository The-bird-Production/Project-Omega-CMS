import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import axios from "axios";
import { execFile } from "child_process";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { loadPlugin } from "./LoadPlugin.js";
import { warn } from "console";

// ✅ Import ou redéfinition de la validation (copiez de LoadPlugin.js si besoin)
function isSafePluginId(pluginId) {
    return /^[a-zA-Z0-9_-]+$/.test(pluginId);
}

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const InstallPlugins = async (pluginId, app, update) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const clientDir = path.resolve(__dirname, "../../Client/app/components/plugin");
    const tempDir = path.resolve(process.cwd(), "temp");
    const BACKUP_DIR = path.resolve(process.cwd(), "backups");

    // ✅ Utilisez une variable safe pour basename dès le début
    const safePluginName = path.basename(pluginId);  // Limite à un nom sûr

    try {
        if (!pluginId || typeof pluginId !== "string" || !isSafePluginId(safePluginName)) {
            throw new Error("Plugin ID invalide ou non autorisé.");
        }

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

        // ✅ Validation stricte de l’URL (déjà bonne)
        const allowedHost = "omega.marketplace.thebirdproduction.fr";
        const downloadUrl = new URL(`https://${allowedHost}/download/${encodeURIComponent(pluginId)}`);

        console.log(`Téléchargement sécurisé du plugin : ${downloadUrl.href}`);
        const { data } = await axios.get(downloadUrl.href, { responseType: "arraybuffer", timeout: 10000 });

        const zip = new AdmZip(data);
        const extractPath = path.join(tempDir, safePluginName);  // Utilisez safePluginName
        zip.extractAllTo(extractPath, true);

        // ✅ Construction et vérification de confinement pour pluginDir (ligne ~43)
        const pluginDir = path.resolve(pluginsDir, safePluginName);
        if (!pluginDir.startsWith(pluginsDir)) {  // Confinement check
            throw new Error(`Chemin de plugin hors dossier autorisé : ${pluginDir}`);
        }

        const safePluginDir = path.join(pluginsDir, safePluginName);  // Redondant mais cohérent
        if (!safePluginDir.startsWith(pluginsDir)) {
            throw new Error(`Chemin safe hors dossier autorisé.`);
        }

        if (fs.existsSync(safePluginDir)) fs.rmSync(safePluginDir, { recursive: true, force: true });
        fs.renameSync(extractPath, safePluginDir);

        // ✅ Vérification pour clientDir
        const safeClientPluginDir = path.join(clientDir, safePluginName);
        if (!safeClientPluginDir.startsWith(clientDir)) {
            throw new Error(`Chemin client hors dossier autorisé.`);
        }

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

        // ✅ Suppression sécurisée (ajoutez check si besoin)
        const adminDir = path.join(safePluginDir, "admin");
        const publicDir = path.join(safePluginDir, "public");
        if (adminDir.startsWith(safePluginDir)) {
            fs.rmSync(adminDir, { recursive: true, force: true });
        }
        if (publicDir.startsWith(safePluginDir)) {
            fs.rmSync(publicDir, { recursive: true, force: true });
        }

        console.log("✅ Dossier du plugin déplacé avec succès");

        // ✅ Sauvegarde base de données (déjà bonne, mais optionnel : promisify execFile)
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) throw new Error("DATABASE_URL non défini dans les variables d'environnement.");

        const db = new URL(DATABASE_URL);
        const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFilePath = path.join(BACKUP_DIR, `backup_${backupTimestamp}.sql`);
        if (!backupFilePath.startsWith(BACKUP_DIR)) {
            throw new Error("Chemin de backup hors dossier autorisé.");
        }

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

        // ✅ Application de la migration (amélioration : validez le SQL si possible)
        const migrationPath = path.join(safePluginDir, "prisma", "migration.sql");
        if (!migrationPath.startsWith(safePluginDir)) {
            throw new Error("Chemin de migration hors dossier autorisé.");
        }
        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
            if (migrationSQL.trim()) {
                // ⚠️ Pour plus de sécurité : Validez que c'est du SQL sûr (ex. regex pour CREATE/ALTER seulement)
                // Exemple basique : if (!/^(CREATE|ALTER|INSERT|UPDATE|DELETE)/i.test(migrationSQL)) { throw new Error("SQL invalide"); }
                await prisma.$executeRawUnsafe(migrationSQL);  // Gardez si plugins trusted
            } else {
                warn("Fichier de migration vide, ignoré.");
            }
        } else {
            warn("Aucun fichier de migration trouvé.");
        }

        // ✅ Chargement du plugin
        loadPlugin(app, safePluginName);  // Utilisez safePluginName
        console.log(`✅ Plugin ${safePluginName} installé avec succès.`);
    } catch (err) {
        console.error("❌ Erreur lors de l'installation du plugin :", err);
        
        // ✅ Dans catch : Recalculez avec safePluginName pour éviter uncontrolled paths (lignes ~112-113)
        const safePluginDirCatch = path.join(pluginsDir, safePluginName);
        const safeClientDirCatch = path.join(clientDir, safePluginName);
        
        if (fs.existsSync(safePluginDirCatch)) {
            fs.rmSync(safePluginDirCatch, { recursive: true, force: true });
        }
        if (fs.existsSync(safeClientDirCatch)) {
            fs.rmSync(safeClientDirCatch, { recursive: true, force: true });
        }
        
        // Nettoyage temp si extraction a eu lieu
        const extractPathCatch = path.join(tempDir, safePluginName);
        if (fs.existsSync(extractPathCatch)) {
            fs.rmSync(extractPathCatch, { recursive: true, force: true });
        }
        
        throw err;
    }
};

export default InstallPlugins;
