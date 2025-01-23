const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const axios = require("axios");
const cms = require('../../cms');
const { exec } = require('child_process');
const url = require('url');




const InstallPlugins = async (pluginId) => {
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

    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const pluginDir = path.resolve(pluginsDir, pluginId);

    if (fs.existsSync(pluginDir)) {
      throw new Error("Le plugin est déjà installé.");
    }
    //copy the plugin files to the plugins folder
    fs.renameSync(tempDir + `/${pluginId}/`, pluginDir);

    //Move the client files to the client Side 
    const clientDir = path.resolve(cms.dirname, "Client", "app", "components", "plugin")
    fs.mkdirSync(clientDir + `/${pluginId}`);
    fs.renameSync(pluginDir + "/admin/dashboard.js", clientDir + `/${pluginId}/dashboard.js`);
    fs.renameSync(pluginDir + "/public/publicComponent.js", clientDir + `/${pluginId}/publicComponent.js`);
    fs.rmSync(pluginDir + "/admin/");
    fs.rmSync(pluginDir + "/public/");
    
    //Database migration 


    //Backup the database
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${backupTimestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    const DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/db_name';
    const { hostname, port, pathname, auth } = new url.URL(DATABASE_URL);
    const [user, password] = auth.split(':');
    const dbName = pathname.replace('/', ''); 
    const dumpCommand = `mysqldump -u ${user} -p${password} -h ${hostname} -P ${port || 3306} ${dbName} > ${backupFilePath}`;

    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Erreur lors de la sauvegarde :', error.message);
        return;
      }
      if (stderr) {
        console.error('Messages d’erreur :', stderr);
        return;
      }
      console.log(`Sauvegarde réussie : ${backupFilePath}`);
    });

    //Apply the migration
    const migrationPath = path.join(pluginDir, "prisma", 'migration.sql');

    if (!fs.existsSync(migrationPath)) {
      return new Error("Aucun fichier de migration trouvé.");
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    
    if (!migrationSQL.trim()) {
      return new Error("Fichier de migration vide.");
    }

    await prisma.$executeRawUnsafe(migrationSQL);
    
   
  } catch (err) {
    console.error("Erreur lors de l'installation du plugin :", err);
    return err;
  }
};

module.exports = InstallPlugins;
