const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const axios = require("axios");
const cms = require("../../cms");
const { exec } = require("child_process");
const url = require("url");
const { loadPlugin } = require("./LoadPlugin");
const { warn } = require("console");

const InstallPlugins = async (pluginId, app) => {
  const pluginsDir = path.resolve(process.cwd(), "Plugins");
  const pluginDir = path.resolve(pluginsDir, pluginId);
  const clientDir = path.resolve(
    cms.dirname,
    "Client",
    "app",
    "components",
    "plugin"
  );
  try {
    //download the plugin zip file and unzip it into the temp folder

    const tempDir = path.resolve(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const zipFile = await axios.get(
      `https://omega.marketplace.thebirdproduction.fr/download/${pluginId}`,
      {
        responseType: "arraybuffer",
      }
    );
    const zip = new AdmZip(zipFile.data);

    zip.extractAllTo(tempDir + `/${pluginId}/`, true);

    //copy the plugin files to the plugins folder

    if (fs.existsSync(pluginDir)) {
      throw new Error("Le plugin est déjà installé.");
    }
    //copy the plugin files to the plugins folder
    fs.renameSync(tempDir + `/${pluginId}/`, pluginDir);

    //Move the client files to the client Side
    
    fs.mkdirSync(clientDir + `/${pluginId}`);
    fs.renameSync(
      pluginDir + "/admin/dashboard.js",
      clientDir + `/${pluginId}/dashboard.js`
    );
    fs.renameSync(
      pluginDir + "/public/publicComponent.js",
      clientDir + `/${pluginId}/publicComponent.js`
    );
    fs.rmdirSync(pluginDir + "/admin/");
    fs.rmdirSync(pluginDir + "/public/");

    //Database migration

    //Backup the database
    const BACKUP_DIR = path.resolve(process.cwd(), "backups");
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup_${backupTimestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    const DATABASE_URL =
      process.env.DATABASE_URL ||
      "mysql://etienne:Titi@91490@localhost:3306/omega";
    const { hostname, port, pathname, username, password } = new url.URL(DATABASE_URL);
    
    const dbName = pathname.replace("/", "");
    const dumpCommand = `mysqldump -u ${username} -p${password} -h ${hostname} -P ${
      port || 3306
    } ${dbName} > ${backupFilePath}`;

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
  } catch (err) {
    fs.rmSync(pluginDir, { recursive: true });
    fs.rmSync(clientDir + `/${pluginId}`, { recursive: true });
    console.error("Erreur lors de l'installation du plugin :", err);
    return err;
  }
};

module.exports = InstallPlugins;
