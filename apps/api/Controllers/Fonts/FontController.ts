import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@omega/db";

const FINAL_DIR = path.resolve(process.cwd(), "Public", "Fonts");
const ALLOWED_EXTENSIONS = new Set([".woff2", ".woff", ".ttf", ".otf"]);
const FORMAT_BY_EXTENSION: Record<string, string> = {
  ".woff2": "woff2",
  ".woff": "woff",
  ".ttf": "truetype",
  ".otf": "opentype",
};

export const listFonts = async (req: Request, res: Response) => {
  try {
    const fonts = await prisma.customFont.findMany({ orderBy: [{ family: "asc" }, { id: "asc" }] });
    res.status(200).json({ code: 200, data: fonts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

export const uploadFont = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: "Aucun fichier reçu." });
  }

  const family = typeof req.body?.family === "string" ? req.body.family.trim() : "";
  const weight = typeof req.body?.weight === "string" && req.body.weight.trim() ? req.body.weight.trim() : "400";
  const style = typeof req.body?.style === "string" && req.body.style.trim() ? req.body.style.trim() : "normal";
  if (!family) {
    await fs.rm(req.file.path, { force: true });
    return res.status(400).json({ code: 400, message: "Un nom de police (font-family) est requis." });
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    await fs.rm(req.file.path, { force: true });
    return res.status(400).json({ code: 400, message: "Format non autorisé (.woff2, .woff, .ttf ou .otf uniquement)." });
  }

  try {
    // FINAL_DIR is gitignored runtime data (apps/api/.gitignore's
    // /Public/), never created by anything else up front — see the same
    // fix just applied to image/file uploads for why this has to happen
    // here rather than being assumed to already exist.
    await fs.mkdir(FINAL_DIR, { recursive: true });
    const safeFilename = path.basename(req.file.filename) + extension;
    const finalPath = path.resolve(FINAL_DIR, safeFilename);
    await fs.rename(req.file.path, finalPath);

    const created = await prisma.customFont.create({
      data: { family, file: safeFilename, weight, style },
    });
    res.status(201).json({ code: 201, data: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

export const deleteFont = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const font = await prisma.customFont.delete({ where: { id } });
    await fs.rm(path.join(FINAL_DIR, font.file), { force: true });
    res.status(200).json({ code: 200, message: "Police supprimée." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Internal Server Error " + error });
  }
};

// Public — a plain CSS stylesheet of @font-face rules for every uploaded
// font, linked from the public site's own <head> (see
// apps/web/app/layout.js) so a theme's own CSS can reference any of these
// family names exactly like a web-safe font, no theme cooperation needed
// beyond knowing the name an admin chose when uploading.
export const getFontsCss = async (req: Request, res: Response) => {
  try {
    const fonts = await prisma.customFont.findMany();
    const backendUrl = process.env.BACKEND_URL || "";
    const css = fonts
      .map((font: { family: string; file: string; weight: string; style: string }) => {
        const extension = path.extname(font.file).toLowerCase();
        const format = FORMAT_BY_EXTENSION[extension] || "woff2";
        const url = `${backendUrl}/fonts/${font.file}`;
        return `@font-face {\n  font-family: "${font.family.replace(/"/g, '\\"')}";\n  src: url("${url}") format("${format}");\n  font-weight: ${font.weight};\n  font-style: ${font.style};\n  font-display: swap;\n}`;
      })
      .join("\n\n");

    res.setHeader("Content-Type", "text/css");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.status(200).send(css);
  } catch (error) {
    console.error(error);
    res.status(500).type("text/css").send("");
  }
};
