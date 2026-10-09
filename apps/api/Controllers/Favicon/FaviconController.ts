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

// BACKEND_URL isn't set in every deployment (the official compose file
// didn't pass it for a long time) — without a fallback this produced
// "undefined/favicon/favicon.png", a URL that 404s on the site's own
// origin, so the uploaded favicon never showed. Same fix as
// CreateArticleImage: fall back to the URL this request came in on, and
// also return the bare `file` so the web app can build the URL from its
// own NEXT_PUBLIC_BACKEND_URL (which, unlike this fallback, is right even
// behind a TLS-terminating proxy).
function faviconUrl(req: Request, file: string): string {
  return `${process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`}/favicon/${file}`;
}

export const GetFavicon = async (req: Request, res: Response) => {
  const file = findCurrentFavicon();
  res.json(file ? { url: faviconUrl(req, file), file } : { url: null, file: null });
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
    res.json({ url: faviconUrl(req, `favicon${extension}`), file: `favicon${extension}` });
  } catch (e) {
    console.error("Erreur UploadFavicon:", e);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
