const fs = require("fs");
const path = require("path");

exports.getPlugins = (req, res) => {
  const pluginsDir = path.resolve(process.cwd(), "Plugins");
  const plugins = fs.readdirSync(pluginsDir).map((plugin) => {
    const manifest = require(path.join(pluginsDir, plugin, "plugin.json"));
    return {
      name: manifest.name,
      version: manifest.version,
      description : manifest.description,
      folder: manifest.folder
    };
  });
  res.json(plugins);
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
