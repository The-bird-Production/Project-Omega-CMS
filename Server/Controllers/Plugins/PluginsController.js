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
  const response = await fetch(
    "https://omega.marketplace.thebirdproduction.fr/plugins"
  );
  const plugins = await response.json();

  res.json(plugins);
};

exports.InstallPlugin = async (req,res, router) => {
  const pluginId = req.params.id;

  try {
    await InstallPlugins(pluginId, router);
  } catch(err) {
    console.error(err);
    res.status(500).json({error: "Erreur lors de l'installation du plugin"});
  }

  
  
  

}

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
