const fs = require("fs");
const path = require("path");
const InstallTheme = require("../../Functions/InstallTheme");

exports.getThemeInstalled = (req, res) => {
  const themeDir = path.resolve(process.cwd(), "Themes");

  const themes = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").map((theme) => {
    const manifest = require(path.join(themeDir, theme, "theme.json"));
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

exports.getInstallableThemes = async (req, res) => {
  const themeDir = path.resolve(process.cwd(), "Themes");

  // Récupérer les thèmes déjà installés
  const installedTheme = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").map((theme) => {
    const manifest = require(path.join(themeDir, theme, "theme.json"));
    return manifest.id; // Comparaison via l'ID du theme
  });

  try {
    // Récupérer les plugins disponibles sur le marketplace
    const response = await fetch(
      "https://omega.marketplace.thebirdproduction.fr/themes"
    );

    if (!response.ok) {
      return res
        .status(500)
        .json({
          error: "Erreur lors de la récupération des themes disponibles",
        });
    }

    const availableThemes = await response.json();

    // Filtrer les plugins déjà installés
    const nonInstalledTheme = availableThemes.themes.filter(
      (theme) => !installedTheme.includes(theme.id)
    );

    res.json(nonInstalledTheme);
  } catch (err) {
    console.error("Erreur lors de la récupération des themes : ", err);
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des themes disponibles",
      });
  }
};

exports.InstallTheme = async (req, res) => {
  const themeId = req.params.id;

  try {
    await InstallTheme(themeId, false);
    res
      .status(200)
      .json({ success: true, message: "Theme installé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'installation du theme" });
  }
};


exports.getAllThemes = async (req,res) => {
  try {
    const response = await fetch(
      "https://omega.marketplace.thebirdproduction.fr/themes"
    );

    if (!response.ok) {
      return res
        .status(500)
        .json({
          error: "Erreur lors de la récupération des themes disponibles",
        });
    }

    const availableTheme = await response.json();

    

    res.json({code: 200, availableTheme});
  } catch (err) {
    console.error("Erreur lors de la récupération des themes : ", err);
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des themes disponibles",
      });
  }

}

exports.UpdateTheme = async (req, res) => {
  const themeId = req.params.id;

  try {
    await InstallTheme(themeId, true);
    res
      .status(200)
      .json({ success: true, message: "mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'installation du plugin" });
  }
};

exports.getCurrentTheme = (req, res) => {
  const themeDir = path.resolve(process.cwd(), "Themes");

  // Récupérer le thème actuellement utilisé
  const currentTheme = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").filter((theme) => theme.toLowerCase() !== "default").map((theme) => {
    const manifest = require(path.join(themeDir, theme, "theme.json"));
    return manifest; // Retourne le manifest du thème
  });
  if (currentTheme.length === 0) {
    return res.status(404).json({ error: "Aucun thème actuellement utilisé switch to default" });
  }
  res.json(currentTheme[0]);
}

exports.getDefaultTheme = (req, res) => {
  const themeDir = path.resolve(process.cwd(), "Themes", "default");
  if (!fs.existsSync(themeDir)) {
    return res.status(404).json({ error: "Thème par défaut non trouvé" });
  }
  const manifestPath = path.join(themeDir, "theme.json");
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: "Manifest du thème par défaut non trouvé" });
  }
  const manifest = require(manifestPath);
  res.json(manifest);
};
