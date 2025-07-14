const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const axios = require("axios");
const cms = require("../../cms");


const InstallTheme = async (themeId, update) => {
  const ThemesDir = path.resolve(process.cwd(), "Themes");
  const themeDir = path.resolve(ThemesDir, themeId);
  const clientDir = path.resolve(
    cms.dirname,
    "Client",
    "app",
    "Themes"
  );
  const styleDir = path.resolve(cms.dirname, "Client", "public", "themes");
  try {
    //download the plugin zip file and unzip it into the temp folder
    const tempDir = path.resolve(process.cwd(), "temp");
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }


    

    

    const zipFile = await axios.get(
      `https://omega.marketplace.thebirdproduction.fr/download/theme/${themeId}`,
      {
        responseType: "arraybuffer",
      }
    );
    const zip = new AdmZip(zipFile.data);

    zip.extractAllTo(tempDir + `/${themeId}/`, true);

    //Copy the plugin files to the plugin folder and move the client files to the client Side

    setTimeout(() => {
      try {
        fs.renameSync(tempDir + `/${themeId}`, themeDir);

        if (!update) {
          fs.mkdirSync(clientDir + `/${themeId}`);
        }

        fs.renameSync(themeDir + '/components', clientDir + `/${themeId}/components`);
        fs.renameSync(themeDir + '/asset', clientDir + `/${themeId}/asset`);
        fs.renameSync(themeDir + '/style', styleDir + `/${themeId}`);

        console.log("Dossier déplacé avec succès !");
      } catch (error) {
        console.error("Erreur lors du déplacement :", error);
        return error;
      }
    }, 100);

    
  } catch (err) {
    console.error("Erreur lors de l'installation du theme :", err);
    fs.rmSync(themeDir, { recursive: true, force: true });
    fs.rmSync(clientDir + `/${themeId}`, { recursive: true, force: true });
    fs.rmSync(styleDir + "themes" + `/${themeId}`, { recursive: true, force: true });

    return err;
  }
};
module.exports = InstallTheme;
