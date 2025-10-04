import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import express from "express";

// Dossier contenant les plugins
const PLUGIN_DIR = path.resolve(process.cwd(), "Plugins");

/**
 * Vérifie qu'un nom de plugin est sûr (évite path traversal)
 */
function isSafePluginId(pluginId) {
    return /^[a-zA-Z0-9_-]+$/.test(pluginId);
}

/**
 * Charge un plugin spécifique
 */
export const loadPlugin = async (app, pluginId) => {
    try {
        if (!pluginId || typeof pluginId !== "string" || !isSafePluginId(pluginId)) {
            console.warn(`❌ Plugin ID invalide ou non autorisé : ${pluginId}`);
            return;
        }

        const pluginDir = path.join(PLUGIN_DIR, pluginId);
        const pluginJsonPath = path.join(pluginDir, "plugin.json");

        if (!fs.existsSync(pluginJsonPath)) {
            console.warn(`⚠️ Le plugin "${pluginId}" n'a pas de fichier plugin.json.`);
            return;
        }

        let pluginData;
        try {
            const content = fs.readFileSync(pluginJsonPath, "utf-8");
            pluginData = JSON.parse(content);
        } catch (e) {
            console.error(`❌ Fichier plugin.json corrompu pour "${pluginId}" :`, e);
            return;
        }

        const { id, url } = pluginData;
        const safeUrl = typeof url === "string" && url.startsWith("/") ? url : `/${pluginId}`;

        const pluginRoutesPath = path.join(pluginDir, "Routes", "MainRoutes.js");

        if (!fs.existsSync(pluginRoutesPath)) {
            console.warn(`⚠️ Le plugin "${id}" n'a pas de fichier Routes/MainRoutes.js.`);
            return;
        }

        // ✅ Chargement dynamique sécurisé
        const routesModule = await import(pathToFileURL(pluginRoutesPath).href);
        const pluginRoutes = routesModule.default || routesModule.router || routesModule;

        if (typeof pluginRoutes !== "function" && !(pluginRoutes instanceof express.Router)) {
            console.warn(`⚠️ Le plugin "${id}" n'a pas exporté de route Express valide.`);
            return;
        }

        app.use(safeUrl, pluginRoutes);
        console.log(`✅ Plugin chargé : ${id} → ${safeUrl}`);
    } catch (err) {
        console.error(`❌ Erreur lors du chargement du plugin "${pluginId}" :`, err);
    }
};

/**
 * Charge tous les plugins présents dans le dossier
 */
export const loadAllPlugins = async (app) => {
    if (!fs.existsSync(PLUGIN_DIR)) {
        console.warn(`⚠️ Aucun dossier "Plugins" trouvé à ${PLUGIN_DIR}`);
        return;
    }

    const pluginDirs = fs.readdirSync(PLUGIN_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && isSafePluginId(dirent.name))
        .map((dirent) => dirent.name);

    for (const pluginId of pluginDirs) {
        await loadPlugin(app, pluginId);
    }
};

export default {
    loadPlugin,
    loadAllPlugins,
};
