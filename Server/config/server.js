export const CORS = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};
export const app_port = process.env.APP_PORT || 3001;
export const URL = "http://localhost:" + app_port;
