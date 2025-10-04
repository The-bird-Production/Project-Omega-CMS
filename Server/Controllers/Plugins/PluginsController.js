import fs from "fs";
import path from "path";
import InstallPlugins from "../../Functions/InstallPlugins.js";
export const getPluginsInstalled = (req, res) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const plugins = fs.readdirSync(pluginsDir)
        .filter((plugin) => plugin.toLowerCase() !== "readme.md")
        .map((plugin) => {
        return {
            name: manifest.name,
            id: manifest.id,
            version: manifest.version,
            description: manifest.description,
            folder: manifest.folder,
        };
    });
    res.json(plugins);
};
export const getInstallablePlugins = async (req, res) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    // Récupérer les plugins déjà installés
    const installedPlugins = fs.readdirSync(pluginsDir)
        .filter((plugin) => plugin.toLowerCase() !== "readme.md")
        .map((plugin) => {
        return manifest.id; // Comparaison via l'ID du plugin
    });
    try {
        // Récupérer les plugins disponibles sur le marketplace
        const response = await fetch("https://omega.marketplace.thebirdproduction.fr/plugins");
        if (!response.ok) {
            return res
                .status(500)
                .json({
                error: "Erreur lors de la récupération des plugins disponibles",
            });
        }
        const availablePlugins = await response.json();
        // Filtrer les plugins déjà installés
        const nonInstalledPlugins = availablePlugins.plugins.filter((plugin) => !installedPlugins.includes(plugin.id));
        res.json(nonInstalledPlugins);
    }
    catch (err) {
        console.error("Erreur lors de la récupération des plugins : ", err);
        res
            .status(500)
            .json({
            error: "Erreur lors de la récupération des plugins disponibles",
        });
    }
};
export const InstallPlugin = async (req, res, router) => {
    const pluginId = req.params.id;
    try {
        await InstallPlugins(pluginId, router, false);
        res
            .status(200)
            .json({ success: true, message: "Plugin installé avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'installation du plugin" });
    }
};
export const getUserRoutes = (req, res) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    const routes = fs
        .readdirSync(pluginsDir)
        .filter((plugin) => plugin.toLowerCase() !== "readme.md")
        .map((plugin) => {
        return manifest.user?.routes || [];
    })
        .flat();
    res.json(routes);
};
export const getAllPlugins = async (req, res) => {
    try {
        const response = await fetch("https://omega.marketplace.thebirdproduction.fr/plugins");
        if (!response.ok) {
            return res
                .status(500)
                .json({
                error: "Erreur lors de la récupération des plugins disponibles",
            });
        }
        const availablePlugins = await response.json();
        res.json({ code: 200, availablePlugins });
    }
    catch (err) {
        console.error("Erreur lors de la récupération des plugins : ", err);
        res
            .status(500)
            .json({
            error: "Erreur lors de la récupération des plugins disponibles",
        });
    }
};
export const UpdatePlugin = async (req, res, router) => {
    const pluginId = req.params.id;
    try {
        await InstallPlugins(pluginId, router, true);
        res
            .status(200)
            .json({ success: true, message: "mis à jour avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'installation du plugin" });
    }
};
