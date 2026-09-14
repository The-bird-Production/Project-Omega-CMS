import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { checkForUpdate } from "../../Functions/Updater/checkForUpdate.js";
import { applyUpdate } from "../../Functions/Updater/applyUpdate.js";

// Admin-only (mounted with VerifyPermissions("admin")): triggers a live
// GitHub API call and a DB write, more than the public /system/version
// summary should do on every anonymous request.
export const triggerCheck = async (_req: Request, res: Response) => {
  try {
    const status = await checkForUpdate();
    res.json(status);
  } catch (err) {
    console.error("Erreur lors de la vérification de mise à jour :", err);
    res.status(500).json({ error: "Erreur lors de la vérification de mise à jour" });
  }
};

// Admin-only: actually applies a pending update (git worktree + rsync +
// pnpm install/migrate, see applyUpdate.ts) and, on success, exits the
// process for the supervisor (systemd) to restart with the new code — so a
// successful response here means "applying now", not necessarily "already
// running the new version" by the time the client sees it.
export const triggerApply = async (_req: Request, res: Response) => {
  try {
    const result = await applyUpdate();
    res.json(result);
  } catch (err) {
    console.error("Erreur lors de l'application de la mise à jour :", err);
    res.status(500).json({ error: "Erreur lors de l'application de la mise à jour: " + (err as Error).message });
  }
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    res.json({
      autoUpdateEnabled: settings?.autoUpdateEnabled ?? false,
      updateChannel: settings?.updateChannel ?? "stable",
      lastCheckedAt: settings?.lastCheckedAt ?? null,
      lastVersionSeen: settings?.lastVersionSeen ?? null,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des paramètres :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des paramètres" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const { autoUpdateEnabled, updateChannel } = req.body as { autoUpdateEnabled?: unknown; updateChannel?: unknown };

  if (autoUpdateEnabled !== undefined && typeof autoUpdateEnabled !== "boolean") {
    return res.status(400).json({ error: "autoUpdateEnabled doit être un booléen" });
  }
  if (updateChannel !== undefined && typeof updateChannel !== "string") {
    return res.status(400).json({ error: "updateChannel doit être une chaîne" });
  }

  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...(autoUpdateEnabled !== undefined ? { autoUpdateEnabled } : {}),
        ...(updateChannel !== undefined ? { updateChannel } : {}),
      },
      update: {
        ...(autoUpdateEnabled !== undefined ? { autoUpdateEnabled } : {}),
        ...(updateChannel !== undefined ? { updateChannel } : {}),
      },
    });
    res.json(settings);
  } catch (err) {
    console.error("Erreur lors de la mise à jour des paramètres :", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres" });
  }
};
