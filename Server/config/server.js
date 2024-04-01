exports.CORS = {
  origin: "http://localhost/*",
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
};

exports.app_port = 3001;
exports.URL = "http://localhost:" + this.app_port;
