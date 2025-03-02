const { execSync } = require("child_process");
require("dotenv").config({ path: ".env.test" });

module.exports = async () => {
  console.log("🔄 Reset de la base de données de test...");
  execSync("npm run test:setup", { stdio: "inherit" });
};
