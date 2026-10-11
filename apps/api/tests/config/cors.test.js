import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import request from "supertest";

const { CORS } = await import("../../lib/serverConfig.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.resolve(__dirname, "../../Routes");

function routeFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(full);
    return /\.(ts|js)$/.test(entry.name) ? [full] : [];
  });
}

// The admin (another origin than the API) calls these routes with fetch:
// a method missing from CORS.methods is refused by the browser's preflight
// before the request is even sent, while working fine from curl/tests.
describe("CORS methods", () => {
  test("allow every HTTP method used by a route", () => {
    const used = new Set();
    for (const file of routeFiles(ROUTES_DIR)) {
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(/\brouter\.(get|post|put|patch|delete)\s*\(/g)) {
        used.add(match[1].toUpperCase());
      }
    }
    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((method) => !CORS.methods.includes(method))).toEqual([]);
  });

  // config/ survives updates (persisted on existing installs), so the app
  // must never read its settings from there or a fix like the one above
  // never reaches production.
  test("no application code imports the persisted config/ directory", () => {
    const API_DIR = path.resolve(__dirname, "../..");
    const SKIP = new Set(["node_modules", "tests", "config", "Public", "Plugins", "Themes", "Themes_style", "PluginsClient"]);
    const files = (function walk(dir) {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (SKIP.has(entry.name)) return [];
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return /\.(ts|js|mts|mjs)$/.test(entry.name) ? [full] : [];
      });
    })(API_DIR);
    const offenders = files.filter((file) => /from\s+["'][./]*config\/server(\.js)?["']/.test(fs.readFileSync(file, "utf8")));
    expect(files.length).toBeGreaterThan(10);
    expect(offenders.map((f) => path.relative(API_DIR, f))).toEqual([]);
  });

  test("the preflight for a PATCH from an allowed origin accepts it", async () => {
    const app = express();
    app.use(cors(CORS));
    const origin = Array.isArray(CORS.origin) ? CORS.origin[0] : CORS.origin;

    const res = await request(app)
      .options("/system/site")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "PATCH");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-methods"].split(",")).toContain("PATCH");
    expect(res.headers["access-control-allow-origin"]).toBe(origin);
  });
});
