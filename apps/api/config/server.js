// ALLOWED_ORIGINS accepts a comma-separated list so a single instance can serve multiple hostnames.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const CORS = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};
export const app_port = process.env.APP_PORT || 3001;
export const URL = process.env.APP_URL || "http://localhost:" + app_port;
