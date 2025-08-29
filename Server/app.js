import mainRoute from "./Routes/Article/MainRoute.js";
import express, { json, urlencoded as _urlencoded } from "express";
import { CORS } from './config/server.js';
import { toNodeHandler } from 'better-auth/node';
//Security
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { urlencoded } from "express";
import morgan from "morgan";
import limiter from './Middleware/Limiter.js';
//Auth
import { auth } from './lib/auth.js';
import AuthRoute from "./Routes/Auth/MainRoute.js";
import FileRoute from "./Routes/Files/MainRoute.js";
import ImageRoute from "./Routes/Images/MainRoute.js";
import LogRoute from "./Routes/LogRoute/MainRoute.js";
import Stats from "./Routes/Stats/Api/MainRoute.js";
import web_stats from "./Routes/Stats/Web/MainRoute.js";
import OtherStats from './Routes/Stats/Other/MainRoute.js';
import RoleRoute from "./Routes/Role/MainRoute.js";
import PageRoute from './Routes/Pages/MainRoutes.js';
import PluginsRoute from './Routes/Plugins/MainRoute.js';
import RedirectRoute from './Routes/Redirect/MainRoute.js';
import ThemesRoute from './Routes/Themes/MainRoute.js';
const app = express();
app.use(limiter);
//Environnement
if (process.env.NODE_ENV == "development") {
    console.log("Backend running in dev mod");
    app.use(morgan("dev"));
}
else if (process.env.NODE_ENV == "production") {
    console.log("Backend running in production mod");
    app.use(morgan("combined"));
}
app.use(helmet());
app.use(compression());
app.use(cors(CORS));
app.use(morgan("dev"));
app.all('/api/auth/*', toNodeHandler(auth));
//JSON
app.use(json());
app.use(_urlencoded({ extended: true }));
//app.use(Stats);
//app.use("/auth", AuthRoute);
app.use("/file", FileRoute);
app.use("/image", ImageRoute);
app.use("/logs", LogRoute);
app.use("/web_stats", web_stats);
app.use('/otherstats', OtherStats);
app.use("/role", RoleRoute);
app.use('/page', PageRoute);
app.use('/plugins', PluginsRoute);
app.use('/redirect', RedirectRoute);
app.use('/article', mainRoute);
app.use('/themes', ThemesRoute);
app.get("/test", (req, res) => {
    res.send("Testing Server");
});
console.log("App Started");
export default app;
