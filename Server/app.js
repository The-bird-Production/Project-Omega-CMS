const express = require("express");
const app = express();
const config = require('./config/server')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Security

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { urlencoded } = require("express");
const morgan = require("morgan");

//Environnement
if (process.env.NODE_ENV == "development") {
  console.log("Backend running in dev mod");
  app.use(morgan("dev"));
} else if (process.env.NODE_ENV == "production") {
  console.log("Backend running in production mod");
  app.use(morgan("combined"));
}
app.use(helmet());
app.use(compression());
app.use(cors(config.CORS));
app.use(morgan("dev"));






const AuthRoute = require("./Routes/Auth/MainRoute");
const FileRoute = require("./Routes/Files/MainRoute");
const ImageRoute = require("./Routes/Images/MainRoute");
const LogRoute = require("./Routes/LogRoute/MainRoute");
const Stats = require("./Routes/Stats/Api/MainRoute");
const web_stats = require("./Routes/Stats/Web/MainRoute");
const OtherStats = require('./Routes/Stats/Other/MainRoute')
const RoleRoute = require("./Routes/Role/MainRoute");
const PageRoute = require('./Routes/Pages/MainRoutes');
const PluginsRoute = require('./Routes/Plugins/MainRoute')

app.use(Stats);
app.use("/auth", AuthRoute);
app.use("/file", FileRoute);
app.use("/image", ImageRoute);
app.use("/logs", LogRoute);
app.use("/web_stats", web_stats);
app.use('/otherstats', OtherStats)
app.use("/role", RoleRoute);
app.use('/page', PageRoute); 
app.use('/plugins', PluginsRoute)


app.get("/test", (req, res) => {
  res.send("Testing Server");
});

console.log("App Started");

module.exports = app;
