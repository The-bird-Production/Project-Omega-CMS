import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import * as axios from "axios";
import * as cms from "../../cms.js";
import { exec } from "child_process";
import url from "url";
import { loadPlugin } from "./LoadPlugin.js";
import { warn } from "console";
const InstallPlugins = async (pluginId, app, update) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const pluginDir = path.resolve(pluginsDir, pluginId);
    const clientDir = path.resolve(cms.dirname, "Client", "app", "components", "plugin");
    try {
        //download the plugin zip file and unzip it into the temp folder
        const tempDir = path.resolve(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const zipFile = await axios.get(`https://omega.marketplace.thebirdproduction.fr/download/${pluginId}`, {
            responseType: "arraybuffer",
        });
        const zip = new AdmZip(zipFile.data);
        zip.extractAllTo(tempDir + `/${pluginId}/`, true);
        //Copy the plugin files to the plugin folder and move the client files to the client Side
        setTimeout(() => {
            try {
                fs.renameSync(tempDir + `/${pluginId}`, pluginDir);
                if (!update) {
                    fs.mkdirSync(clientDir + `/${pluginId}`);
                }
                fs.renameSync(pluginDir + "/admin/dashboard.js", clientDir + `/${pluginId}/dashboard.js`);
                fs.renameSync(pluginDir + "/public/publicComponent.js", clientDir + `/${pluginId}/publicComponent.js`);
                fs.rmdirSync(pluginDir + "/admin/");
                fs.rmdirSync(pluginDir + "/public/");
                console.log("Dossier déplacé avec succès !");
            }
            catch (error) {
                console.error("Erreur lors du déplacement :", error);
                return error;
            }
        }, 100);
        //Database migration
        //Backup the database
        const BACKUP_DIR = path.resolve(process.cwd(), "backups");
        const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileName = `backup_${backupTimestamp}.sql`;
        const backupFilePath = path.join(BACKUP_DIR, backupFileName);
        const DATABASE_URL = process.env.DATABASE_URL ||
            "mysql://etienne:Titi@91490@localhost:3306/omega";
        const { hostname, port, pathname, username, password } = new url.URL(DATABASE_URL);
        const dbName = pathname.replace("/", "");
        const dumpCommand = `mysqldump -u ${username} -p${password} -h ${hostname} -P ${port || 3306} ${dbName} > ${backupFilePath}`;
        if (!(process.env.NODE_ENV === "development")) {
            exec(dumpCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error("Erreur lors de la sauvegarde :", error.message);
                    return;
                }
                if (stderr) {
                    console.error("Messages d’erreur :", stderr);
                    return;
                }
                console.log(`Sauvegarde réussie : ${backupFilePath}`);
            });
        }
        //Apply the migration
        const migrationPath = path.join(pluginDir, "prisma", "migration.sql");
        if (!fs.existsSync(migrationPath)) {
            return warn("Aucun fichier de migration trouvé.");
        }
        const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
        if (!migrationSQL.trim()) {
            return warn("Fichier de migration vide.");
        }
        await prisma.$executeRawUnsafe(migrationSQL);
        //Load plugins routes
        loadPlugin(app, pluginId);
    }
    catch (err) {
        console.error("Erreur lors de l'installation du plugin :", err);
        fs.rmSync(pluginDir, { recursive: true, force: true });
        fs.rmSync(clientDir + `/${pluginId}`, { recursive: true, force: true });
        return err;
    }
};
export default InstallPlugins;
