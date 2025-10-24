import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import * as axios from "axios";
import sanitize from "sanitize-filename";
const InstallTheme = async (themeId, update) => {
  if (process.env.NODE_ENV !== "production") {
    const cms = await import("../../cms.js");
    console.log("Installing theme in development mode...");

    const sanitizedThemeId = sanitize(themeId);
    const ThemesDir = path.resolve(process.cwd(), "Themes");
    const themeDir = path.resolve(ThemesDir, sanitizedThemeId);
    const clientDir = path.resolve(cms.dirname, "Client", "app", "Themes");
    const styleDir = path.resolve(cms.dirname, "Client", "public", "themes");
    try {
      //download the plugin zip file and unzip it into the temp folder
      const tempDir = path.resolve(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const zipFile = await axios.get(
        `https://omega.marketplace.thebirdproduction.fr/download/theme/${sanitizedThemeId}`,
        {
          responseType: "arraybuffer",
        }
      );
      const zip = new AdmZip(zipFile.data);
      zip.extractAllTo(tempDir + `/${sanitizedThemeId}/`, true);
      //Copy the plugin files to the plugin folder and move the client files to the client Side
      setTimeout(() => {
        try {
          fs.renameSync(tempDir + `/${sanitizedThemeId}`, themeDir);
          if (!update) {
            fs.mkdirSync(clientDir + `/${sanitizedThemeId}`);
          }
          fs.renameSync(
            themeDir + "/components",
            clientDir + `/${sanitizedThemeId}/components`
          );
          fs.renameSync(
            themeDir + "/asset",
            clientDir + `/${sanitizedThemeId}/asset`
          );
          fs.renameSync(themeDir + "/style", styleDir + `/${sanitizedThemeId}`);
          console.log("Dossier déplacé avec succès !");
        } catch (error) {
          console.error("Erreur lors du déplacement :", error);
          return error;
        }
      }, 100);
    } catch (err) {
      console.error("Erreur lors de l'installation du theme :", err);
      fs.rmSync(themeDir, { recursive: true, force: true });
      fs.rmSync(clientDir + `/${sanitizedThemeId}`, {
        recursive: true,
        force: true,
      });
      fs.rmSync(styleDir + "themes" + `/${sanitizedThemeId}`, {
        recursive: true,
        force: true,
      });
      return err;
    }
  } else {
    console.log("Installing theme in production mode...");

    const sanitizedThemeId = sanitize(themeId);

    const ThemesDir = path.resolve(process.cwd(), "Themes");

    const themeDir = path.resolve(ThemesDir, sanitizedThemeId);

    const styleDir = path.resolve(process.cwd(), "Themes_style");

    try {
      //download the plugin zip file and unzip it into the temp folder
      const tempDir = path.resolve(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const zipFile = await axios.get(
        `https://omega.marketplace.thebirdproduction.fr/download/theme/${sanitizedThemeId}`,
        {
          responseType: "arraybuffer",
        }
      );
      const zip = new AdmZip(zipFile.data);
      zip.extractAllTo(tempDir + `/${sanitizedThemeId}/`, true);
      //Copy the plugin files to the plugin folder and move the client files to the client Side
      setTimeout(() => {
        try {
          if (!update) {
            fs.mkdirSync(themeDir);
          }
          fs.renameSync(tempDir + `/${sanitizedThemeId}`, themeDir);

          fs.renameSync(
            themeDir + "/asset",
            styleDir + `/${sanitizedThemeId}/asset`
          );
          fs.renameSync(themeDir + "/style", styleDir + `/${sanitizedThemeId}`);
          console.log("Dossier déplacé avec succès !");
        } catch (error) {
          console.error("Erreur lors du déplacement :", error);
          return error;
        }
      }, 100);
    } catch (err) {
      console.error("Erreur lors de l'installation du theme :", err);
      fs.rmSync(themeDir, { recursive: true, force: true });
      fs.rmSync(styleDir + "themes" + `/${sanitizedThemeId}`, {
        recursive: true,
        force: true,
      });
      return err;
    }
  }
};
export default InstallTheme;
