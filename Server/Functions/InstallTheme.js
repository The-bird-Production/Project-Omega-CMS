import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import axios from "axios";
import sanitize from "sanitize-filename";

// Throws if targetPath does not resolve to a location inside baseDir (path traversal / zip-slip guard).
export function assertInside(baseDir, targetPath, label) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  if (resolvedTarget !== resolvedBase && !resolvedTarget.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Chemin ${label} hors dossier autorisé : ${resolvedTarget}`);
  }
  return resolvedTarget;
}

export function assertSafeZipEntries(zip, extractDir) {
  for (const entry of zip.getEntries()) {
    assertInside(extractDir, path.join(extractDir, entry.entryName), "d'entrée d'archive");
  }
}

function moveInto(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.renameSync(srcDir, destDir);
}

const InstallTheme = async (themeId, update) => {
  const isDev = process.env.NODE_ENV !== "production";

  const sanitizedThemeId = sanitize(themeId);
  if (!sanitizedThemeId) {
    throw new Error("Theme ID invalide ou non autorisé.");
  }

  const themesDir = path.resolve(process.cwd(), "Themes");
  const themeDir = assertInside(themesDir, path.join(themesDir, sanitizedThemeId), "de thème");
  const tempDir = path.resolve(process.cwd(), "temp");
  const extractDir = assertInside(tempDir, path.join(tempDir, sanitizedThemeId), "temporaire");

  let clientDir = null;
  let styleDir;
  if (isDev) {
    const cms = await import("../../cms.js");
    clientDir = path.resolve(cms.dirname, "Client", "app", "Themes");
    styleDir = path.resolve(cms.dirname, "Client", "public", "themes");
  } else {
    styleDir = path.resolve(process.cwd(), "Themes_style");
  }

  try {
    console.log(`Installing theme in ${isDev ? "development" : "production"} mode...`);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const allowedHost = "omega.marketplace.thebirdproduction.fr";
    const downloadUrl = new URL(`https://${allowedHost}/download/theme/${encodeURIComponent(sanitizedThemeId)}`);
    const { data } = await axios.get(downloadUrl.href, { responseType: "arraybuffer", timeout: 10000 });

    const zip = new AdmZip(data);
    assertSafeZipEntries(zip, extractDir);
    zip.extractAllTo(extractDir, true);

    if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
    fs.renameSync(extractDir, themeDir);

    if (isDev) {
      const safeClientThemeDir = assertInside(clientDir, path.join(clientDir, sanitizedThemeId), "client de thème");
      if (!update && !fs.existsSync(safeClientThemeDir)) {
        fs.mkdirSync(safeClientThemeDir, { recursive: true });
      }
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, sanitizedThemeId), "de style");

      moveInto(path.join(themeDir, "components"), path.join(safeClientThemeDir, "components"));
      moveInto(path.join(themeDir, "asset"), path.join(safeClientThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    } else {
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, sanitizedThemeId), "de style");

      moveInto(path.join(themeDir, "asset"), path.join(safeStyleThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    }

    console.log("✅ Thème installé avec succès.");
  } catch (err) {
    console.error("Erreur lors de l'installation du theme :", err);

    if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    if (isDev && clientDir) {
      const clientThemeDir = path.join(clientDir, sanitizedThemeId);
      if (fs.existsSync(clientThemeDir)) fs.rmSync(clientThemeDir, { recursive: true, force: true });
    }
    const styleThemeDir = path.join(styleDir, sanitizedThemeId);
    if (fs.existsSync(styleThemeDir)) fs.rmSync(styleThemeDir, { recursive: true, force: true });

    throw err;
  }
};

export default InstallTheme;
