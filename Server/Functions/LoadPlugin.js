import fs from "fs";
import path from "path";
import express from "express";

// Dossier contenant les plugins
const PLUGIN_DIR = path.resolve(process.cwd(), "Plugins");

// Validation stricte du pluginId (évite path traversal)
function isSafePluginId(pluginId) {
  return typeof pluginId === "string" && /^[a-zA-Z0-9_-]+$/.test(pluginId);
}

// Validation simple de l'URL de route
function isSafeUrl(url) {
  return typeof url === "string" && url.startsWith("/");
}

// Fonction pour charger un plugin spécifique
const loadPlugin = async (app, pluginId) => {
  if (!isSafePluginId(pluginId)) {
    console.warn(`Plugin ID invalide ou non autorisé : ${pluginId}`);
    return;
  }

  // Construction sécurisée du chemin du plugin
  const pluginDir = path.resolve(PLUGIN_DIR, pluginId);

  // Vérification que pluginDir est bien dans PLUGIN_DIR (confinement)
  if (!pluginDir.startsWith(PLUGIN_DIR)) {
    console.warn(`Chemin du plugin hors du dossier autorisé : ${pluginDir}`);
    return;
  }

  const pluginJsonPath = path.join(pluginDir, "plugin.json");

  if (!fs.existsSync(pluginJsonPath)) {
    console.warn(`Le plugin "${pluginId}" n'a pas de fichier plugin.json.`);
    return;
  }

  let pluginData;
  try {
    pluginData = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));
  } catch (err) {
    console.error(`Erreur lors de la lecture du plugin.json pour "${pluginId}" :`, err);
    return;
  }

  const { id, url } = pluginData;

  // Validation de l'id et url dans plugin.json
  if (!isSafePluginId(id)) {
    console.warn(`ID de plugin invalide dans plugin.json : ${id}`);
    return;
  }

  const safeUrl = isSafeUrl(url) ? url : `/${id}`;

  try {
    const pluginRoutesPath = path.resolve(pluginDir, "Routes", "MainRoutes.js");

    // Vérification confinement du chemin des routes
    if (!pluginRoutesPath.startsWith(pluginDir)) {
      console.warn(`Chemin des routes hors du dossier plugin : ${pluginRoutesPath}`);
      return;
    }

    if (!fs.existsSync(pluginRoutesPath)) {
      console.warn(`Le plugin "${id}" n'a pas de fichier Routes/MainRoutes.js.`);
      return;
    }

  const pluginRoutes = await import(pluginRoutesPath).then(mod => mod.default ?? mod);

    // Vérification que pluginRoutes est un middleware express valide
    if (typeof pluginRoutes !== "function" && !(pluginRoutes instanceof express.Router)) {
      console.warn(`Le plugin "${id}" n'a pas exporté de route Express valide.`);
      return;
    }

  app.use(safeUrl, pluginRoutes);

    console.log(`Plugin chargé : ${id} avec l'URL ${safeUrl}`);
  } catch (error) {
    console.error(`Erreur lors du chargement du plugin "${id}" :`, error);
  }
};

// Fonction pour charger tous les plugins présents dans le dossier au démarrage
const loadAllPlugins = async (app) => {
  if (!fs.existsSync(PLUGIN_DIR)) {
    console.warn(`Dossier des plugins introuvable : ${PLUGIN_DIR}`);
    return;
  }

  const pluginDirs = fs.readdirSync(PLUGIN_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && isSafePluginId(dirent.name))
    .map(dirent => dirent.name);

  for (const pluginId of pluginDirs) {
    const pluginJsonPath = path.join(PLUGIN_DIR, pluginId, "plugin.json");

    if (!fs.existsSync(pluginJsonPath)) {
      console.warn(`Le plugin "${pluginId}" n'a pas de fichier plugin.json.`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));
    } catch (err) {
      console.error(`Erreur lors de la lecture du plugin.json pour "${pluginId}" :`, err);
      continue;
    }

    const { id } = data;

    if (!isSafePluginId(id)) {
      console.warn(`ID de plugin invalide dans plugin.json : ${id}`);
      continue;
    }

    await loadPlugin(app, id);
  }
};

export { loadPlugin, loadAllPlugins };
