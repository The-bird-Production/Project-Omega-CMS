import type { Request, Response } from "express";
import { prisma } from "@omega/db";

export const SITE_NAME_MAX_LENGTH = 120;

// Public: the web app reads it on every page to build the browser-tab
// title ("<page> | <site name>"). null = not set, the web app then uses
// its own default.
export const getSite = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 }, select: { siteName: true } });
    res.json({ siteName: settings?.siteName ?? null });
  } catch (err) {
    console.error("Erreur lors de la récupération du nom du site :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du nom du site" });
  }
};

// Admin-only. An empty name resets to the default.
export const updateSite = async (req: Request, res: Response) => {
  const { siteName } = (req.body ?? {}) as { siteName?: unknown };
  if (siteName !== null && typeof siteName !== "string") {
    return res.status(400).json({ error: "siteName doit être une chaîne" });
  }
  const value = typeof siteName === "string" ? siteName.trim().replace(/\s+/g, " ") : "";
  if (value.length > SITE_NAME_MAX_LENGTH) {
    return res.status(400).json({ error: `Le nom du site ne peut pas dépasser ${SITE_NAME_MAX_LENGTH} caractères` });
  }

  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      create: { id: 1, siteName: value || null },
      update: { siteName: value || null },
      select: { siteName: true },
    });
    res.json({ siteName: settings.siteName });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement du nom du site :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du nom du site" });
  }
};
