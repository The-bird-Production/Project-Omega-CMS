const app = require("./app");
const config = require("./config/server");
require("dotenv").config();



//Global  Error Handling  Middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: "Internal server error :" + err });
});

app.listen(config.app_port, () => {
  console.log("Backend Start on http://localhost:" + config.app_port);
});
