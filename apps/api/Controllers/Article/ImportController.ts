import type { Request, Response } from "express";
import { importArticles, normalizeSourceUrl } from "../../lib/articleImport.js";

type RequestWithSession = Request & { session?: { user: { id: string } } };

// Admin panel's "Importer des articles" (POST /article/import): imports
// the published articles of an older Project Omega site, see
// lib/articleImport.ts. Body: { source: string, dryRun?: boolean }.
// Answers with the full report once done (a few seconds per article,
// mostly image downloads) rather than streaming progress.
export const importArticlesFromSite = async (req: RequestWithSession, res: Response) => {
  const { source, dryRun } = req.body ?? {};
  try {
    normalizeSourceUrl(source);
  } catch {
    return res.status(400).json({ message: "Adresse invalide : indiquez l'URL complète de l'API de l'ancien site (https://...)." });
  }

  try {
    const report = await importArticles({
      source,
      dryRun: !!dryRun,
      // Same fallback as CreateArticleImage: BACKEND_URL isn't set in every
      // deployment, and the URL this request came in on is this API's own.
      backendUrl: process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`,
      authorId: req.session?.user.id,
    });
    return res.status(200).json(report);
  } catch (error) {
    console.error("Error importing articles:", error);
    return res.status(502).json({ message: `Import impossible : ${(error as Error).message}` });
  }
};
