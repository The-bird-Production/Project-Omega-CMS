const app = require("./app");
const config = require("./config/server");
require("dotenv").config();

//Security

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

app.use(helmet());
app.use(compression());
app.use(cors(config.CORS));

app.listen(config.app_port, () => {
  console.log("Backend Start on http://localhost:" + config.app_port);
});
