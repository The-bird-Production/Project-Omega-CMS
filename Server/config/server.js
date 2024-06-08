exports.CORS = {
  origin: "http://localhost:3000",
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

exports.app_port = 3001;
exports.URL = "http://localhost:" + this.app_port;
