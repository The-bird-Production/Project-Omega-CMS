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
import FileRoute from "./Routes/Files/MainRoute.js";
import ImageRoute from "./Routes/Images/MainRoute.js";
import LogRoute from "./Routes/LogRoute/MainRoute.js";
import Stats from "./Routes/Stats/Api/MainRoute.js";
import trackApiRequest from "./Middleware/ApiStats.js";
import web_stats from "./Routes/Stats/Web/MainRoute.js";
import OtherStats from './Routes/Stats/Other/MainRoute.js';
import PageRoute from './Routes/Pages/MainRoutes.js';
import PluginsRoute from './Routes/Plugins/MainRoute.js';
import RedirectRoute from './Routes/Redirect/MainRoute.js';
import ThemesRoute from './Routes/Themes/MainRoute.js';
import UserRoute from './Routes/User/mainRoute.js';
import SystemRoute from './Routes/System/MainRoute.js';
const app = express();
app.use(cors(CORS));
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
app.use(morgan("dev"));
// Tracks every request regardless of which route below eventually handles
// it — previously this ran as part of the /stats router itself, mounted
// mid-chain, so requests handled by routes registered before it (user,
// file, image, logs, web_stats, otherstats) were silently never tracked.
app.use(trackApiRequest);
app.all('/api/auth/*', toNodeHandler(auth));
//JSON
app.use(json());
app.use(_urlencoded({ extended: true }));
//app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/file", FileRoute);
app.use("/image", ImageRoute);
app.use("/logs", LogRoute);
app.use("/web_stats", web_stats);
app.use('/otherstats', OtherStats);
app.use('/stats', Stats);
app.use('/page', PageRoute);
app.use('/plugins', PluginsRoute);
app.use('/redirect', RedirectRoute);
app.use('/article', mainRoute);
app.use('/themes', ThemesRoute);
app.use('/system', SystemRoute);
app.get("/test", (req, res) => {
    res.send("Testing Server");
});
console.log("App Started");

export default app;

