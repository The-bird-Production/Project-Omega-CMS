import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { getAppVersion } from "../../lib/version.js";

export const getVersion = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

    res.json({
      version: getAppVersion(),
      channel: settings?.updateChannel ?? "stable",
      autoUpdateEnabled: settings?.autoUpdateEnabled ?? false,
      lastCheckedAt: settings?.lastCheckedAt ?? null,
      lastVersionSeen: settings?.lastVersionSeen ?? null,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération de la version :", err);
    res.status(500).json({ error: "Erreur lors de la récupération de la version" });
  }
};
