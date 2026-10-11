// ALLOWED_ORIGINS accepts a comma-separated list so a single instance can serve multiple hostnames.
const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const CORS = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  // Every HTTP method a route uses must be listed, or browsers block it at
  // the CORS preflight (PATCH was missing: saving the site name or update
  // settings from the admin failed). tests/config/cors.test.js checks this.
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
};
export const app_port: string | number = process.env.APP_PORT || 3001;
export const URL: string = process.env.APP_URL || "http://localhost:" + app_port;
