import fs from "fs";
import path from "path";
import InstallTheme from "../../Functions/InstallTheme.js";
export const getThemeInstalled = (req, res) => {
    const themeDir = path.resolve(process.cwd(), "Themes");
    const themes = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").map((theme) => {
        return {
            name: manifest.name,
            id: manifest.id,
            version: manifest.version,
            description: manifest.description,
            folder: manifest.folder,
        };
    });
    res.json(themes);
};
export const getInstallableThemes = async (req, res) => {
    const themeDir = path.resolve(process.cwd(), "Themes");
    // Récupérer les thèmes déjà installés
    const installedTheme = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").map((theme) => {
        return manifest.id; // Comparaison via l'ID du theme
    });
    try {
        // Récupérer les plugins disponibles sur le marketplace
        const response = await fetch("https://omega.marketplace.thebirdproduction.fr/themes");
        if (!response.ok) {
            return res
                .status(500)
                .json({
                error: "Erreur lors de la récupération des themes disponibles",
            });
        }
        const availableThemes = await response.json();
        // Filtrer les plugins déjà installés
        const nonInstalledTheme = availableThemes.themes.filter((theme) => !installedTheme.includes(theme.id));
        res.json(nonInstalledTheme);
    }
    catch (err) {
        console.error("Erreur lors de la récupération des themes : ", err);
        res
            .status(500)
            .json({
            error: "Erreur lors de la récupération des themes disponibles",
        });
    }
};
const InstallTheme$0 = async (req, res) => {
    const themeId = req.params.id;
    try {
        await InstallTheme(themeId, false);
        res
            .status(200)
            .json({ success: true, message: "Theme installé avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'installation du theme" });
    }
};
export const getAllThemes = async (req, res) => {
    try {
        const response = await fetch("https://omega.marketplace.thebirdproduction.fr/themes");
        if (!response.ok) {
            return res
                .status(500)
                .json({
                error: "Erreur lors de la récupération des themes disponibles",
            });
        }
        const availableTheme = await response.json();
        res.json({ code: 200, availableTheme });
    }
    catch (err) {
        console.error("Erreur lors de la récupération des themes : ", err);
        res
            .status(500)
            .json({
            error: "Erreur lors de la récupération des themes disponibles",
        });
    }
};
export const UpdateTheme = async (req, res) => {
    const themeId = req.params.id;
    try {
        await InstallTheme(themeId, true);
        res
            .status(200)
            .json({ success: true, message: "mis à jour avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'installation du plugin" });
    }
};
export const getCurrentTheme = (req, res) => {
    const themeDir = path.resolve(process.cwd(), "Themes");
    // Récupérer le thème actuellement utilisé
    const currentTheme = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").filter((theme) => theme.toLowerCase() !== "default").map((theme) => {
        return manifest; // Retourne le manifest du thème
    });
    if (currentTheme.length === 0) {
        return res.status(404).json({ error: "Aucun thème actuellement utilisé switch to default" });
    }
    res.json(currentTheme[0]);
};
export const getDefaultTheme = (req, res) => {
    const themeDir = path.resolve(process.cwd(), "Themes", "default");
    if (!fs.existsSync(themeDir)) {
        return res.status(404).json({ error: "Thème par défaut non trouvé" });
    }
    const manifestPath = path.join(themeDir, "theme.json");
    if (!fs.existsSync(manifestPath)) {
        return res.status(404).json({ error: "Manifest du thème par défaut non trouvé" });
    }
    res.json(manifest);
};
export { InstallTheme$0 as InstallTheme };
