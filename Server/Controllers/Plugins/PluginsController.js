const fs = require("fs");
const path = require("path");
const InstallPlugins = require("../../Functions/InstallPlugins");

exports.getPluginsInstalled = (req, res) => {
  const pluginsDir = path.resolve(process.cwd(), "Plugins");

  const plugins = fs.readdirSync(pluginsDir).map((plugin) => {
    const manifest = require(path.join(pluginsDir, plugin, "plugin.json"));
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

exports.getInstallablePlugins = async (req, res) => {
  const pluginsDir = path.resolve(process.cwd(), "Plugins");

  // Récupérer les plugins déjà installés
  const installedPlugins = fs.readdirSync(pluginsDir).map((plugin) => {
    const manifest = require(path.join(pluginsDir, plugin, "plugin.json"));
    return manifest.id; // Comparaison via l'ID du plugin
  });

  try {
    // Récupérer les plugins disponibles sur le marketplace
    const response = await fetch(
      "https://omega.marketplace.thebirdproduction.fr/plugins"
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Erreur lors de la récupération des plugins disponibles" });
    }

    const availablePlugins = await response.json();

    // Filtrer les plugins déjà installés
    const nonInstalledPlugins = availablePlugins.filter(
      (plugin) => !installedPlugins.includes(plugin.id)
    );

    res.json(nonInstalledPlugins);
  } catch (err) {
    console.error("Erreur lors de la récupération des plugins : ", err);
    res.status(500).json({ error: "Erreur lors de la récupération des plugins disponibles" });
  }
};

exports.InstallPlugin = async (req, res, router) => {
  const pluginId = req.params.id;

  try {
    await InstallPlugins(pluginId, router);
    res.status(200).json({ success: true, message: "Plugin installé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'installation du plugin" });
  }
};

exports.getUserRoutes = (req, res) => {
  const pluginsDir = path.resolve(process.cwd(), "Plugins");

  const routes = fs
    .readdirSync(pluginsDir)
    .map((plugin) => {
      const manifest = require(path.join(pluginsDir, plugin, "plugin.json"));
      return manifest.user?.routes || [];
    })
    .flat();

  res.json(routes);
};
