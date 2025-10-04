//Convert to esm 
import { configDotenv } from "dotenv";
import { execSync } from "child_process";
configDotenv({path: ".env.test"});

module.exports = async () => {
  console.log("🔄 Reset de la base de données de test...");
  execSync("npm run test:setup", { stdio: "inherit" });
};
