const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const axios = require("axios");
const cms = require('../../cms');

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


  } catch (err) {
    console.error("Erreur lors de l'installation du plugin :", err);
    return err;
  }
};

module.exports = InstallPlugins;
