import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

const FAVICON_DIR = path.resolve(process.cwd(), "Public", "favicon");
const ALLOWED_EXTENSIONS = new Set([".ico", ".png", ".svg"]);

// Only one favicon file lives here at a time, named "favicon<ext>" — no
// DB row needed just to remember which one is current, findCurrentFavicon
// just looks at what's on disk. Whatever extension was uploaded is kept
// (an .ico and a .png aren't interchangeable — browsers request the file
// as-is from the <link rel="icon"> the layout renders).
function findCurrentFavicon(): string | null {
  if (!fs.existsSync(FAVICON_DIR)) return null;
  return fs.readdirSync(FAVICON_DIR).find((file) => ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase())) ?? null;
}

export const GetFavicon = async (req: Request, res: Response) => {
  const file = findCurrentFavicon();
  res.json({ url: file ? `${process.env.BACKEND_URL}/favicon/${file}` : null });
};

export const UploadFavicon = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier reçu." });
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    fs.rm(req.file.path, { force: true }, () => {});
    return res.status(400).json({ message: "Format non autorisé (.ico, .png ou .svg uniquement)." });
  }

  try {
    fs.mkdirSync(FAVICON_DIR, { recursive: true });
    // Clear out any previous favicon (possibly a different extension)
    // before moving the new one in, so there's never more than one file
    // here for findCurrentFavicon() to pick between.
    for (const existing of fs.readdirSync(FAVICON_DIR)) {
      fs.rmSync(path.join(FAVICON_DIR, existing), { force: true });
    }
    const finalPath = path.join(FAVICON_DIR, `favicon${extension}`);
    fs.renameSync(req.file.path, finalPath);
    res.json({ url: `${process.env.BACKEND_URL}/favicon/favicon${extension}` });
  } catch (e) {
    console.error("Erreur UploadFavicon:", e);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
