import fs from "fs";
import path from "path";
// Dossier contenant les plugins
const PLUGIN_DIR = path.join(process.cwd(), "Plugins");
// Fonction pour charger un plugin spécifique
const loadPlugin = (app, pluginId) => {
    const pluginDir = path.join(PLUGIN_DIR, pluginId);
    const pluginJsonPath = path.join(pluginDir, "plugin.json");
    if (fs.existsSync(pluginJsonPath)) {
        const pluginData = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));
        const { id, url } = pluginData;
        try {
            // Charger les routes du plugin
            const pluginRoutesPath = path.join(pluginDir, "Routes", "MainRoutes.js");
            if (fs.existsSync(pluginRoutesPath)) {
                app.use(url || `/${url}`, pluginRoutes); // Utiliser l'URL spécifiée dans le plugin.json
                console.log(`Plugin chargé : ${id} avec l'URL ${url || `/${url}`}`);
            }
            else {
                console.warn(`Le plugin "${id}" n'a pas de fichier routes.js.`);
            }
        }
        catch (error) {
            console.error(`Erreur lors du chargement du plugin "${id}" :`, error);
        }
    }
    else {
        console.warn(`Le plugin "${pluginName}" n'a pas de fichier plugin.json.`);
    }
};
// Fonction pour charger tous les plugins présents dans le dossier au démarrage
const loadAllPlugins = (app) => {
    const pluginDirs = fs.readdirSync(PLUGIN_DIR);
    pluginDirs.forEach((pluginDir) => {
        const pluginJsonPath = path.join(PLUGIN_DIR, pluginDir, "plugin.json");
        if (fs.existsSync(pluginJsonPath)) {
            const data = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));
            const { id } = data;
            loadPlugin(app, id);
        }
    });
};
export { loadPlugin };
export { loadAllPlugins };
export default {
    loadPlugin,
    loadAllPlugins
};
