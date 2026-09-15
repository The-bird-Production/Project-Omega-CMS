import { config } from "dotenv";
import app from "./app.js"; // ton Express app
import { app_port } from "./config/server.js";
import { startUpdateScheduler } from "./Functions/Updater/scheduler.js";
import { initSocket } from "./lib/socket.js";

// Charge les variables d'environnement
config();

startUpdateScheduler();

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: "Internal server error: " + err });
});

// Démarrage du serveur
const server = app.listen(app_port, () => {
  console.log(`Backend started on http://localhost:${app_port}`);
});

initSocket(server);
