export const loadPlugin = async (app, pluginId) => {
    try {
        if (!pluginId || typeof pluginId !== "string" || !isSafePluginId(pluginId)) {
            console.warn(`❌ Plugin ID invalide ou non autorisé : ${pluginId}`);
            return;
        }

        // Construction du chemin principal avec resolve pour ancrage
        const pluginDir = path.resolve(PLUGIN_DIR, pluginId);  // Ajout de resolve ici pour normalisation

        // ✅ NOUVEAU : Vérification de confinement (empêche ../ ou traversals)
        if (!pluginDir.startsWith(PLUGIN_DIR)) {
            console.warn(`❌ Chemin de plugin hors du dossier autorisé : ${pluginDir}`);
            return;
        }

        const pluginJsonPath = path.join(pluginDir, "plugin.json");

        // ✅ Vérification supplémentaire pour pluginJsonPath
        if (!pluginJsonPath.startsWith(PLUGIN_DIR)) {
            console.warn(`❌ Chemin plugin.json hors du dossier autorisé.`);
            return;
        }

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

        // ✅ Vérification pour pluginRoutesPath
        if (!pluginRoutesPath.startsWith(PLUGIN_DIR)) {
            console.warn(`❌ Chemin Routes/MainRoutes.js hors du dossier autorisé.`);
            return;
        }

        if (!fs.existsSync(pluginRoutesPath)) {
            console.warn(`⚠️ Le plugin "${id}" n'a pas de fichier Routes/MainRoutes.js.`);
            return;
        }

        // ✅ Pour l'import dynamique (ligne 65) : Ajoutez une validation URL
        const pluginRoutesUrl = pathToFileURL(pluginRoutesPath).href;
        if (!pluginRoutesUrl.startsWith(pathToFileURL(PLUGIN_DIR).href)) {
            console.warn(`❌ URL d'import hors du dossier autorisé.`);
            return;
        }

        // Chargement dynamique sécurisé
        const routesModule = await import(pluginRoutesUrl);
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
