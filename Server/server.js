const app = require("./app");
const config = require("./config/server");
require("dotenv").config();

//Security

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { urlencoded } = require("express");

if (process.env.NODE_ENV == "development") {
  console.log("Backend running in dev mod");
} else if (process.env.NODE_ENV == "production") {
  console.log("Backend running in production mod");
}

app.use(helmet());
app.use(compression());
app.use(cors(config.CORS));
app.use(urlencoded({ extended: true }));

//Global  Error Handling  Middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: "Internal server error :" + err });
});

app.listen(config.app_port, () => {
  console.log("Backend Start on http://localhost:" + config.app_port);
});
