import type { Request, Response } from "express";
import { prisma } from "@omega/db";
import { activeThemeDir, readThemePages, importPages, parsePageData, type PageData, type PageImportResult } from "../../Functions/PageImport.js";

// Admin "Pages → Importer": pages in the theme content format
// ({ title, body }, see Functions/PageImport.ts), either straight from the
// active theme's content/pages/ or from JSON files the admin uploads.

const MAX_PAGES = 100;

function requestLocale(req: Request): string {
  const locale = typeof req.body?.locale === "string" ? req.body.locale.trim() : "";
  return /^[a-z]{2}$/.test(locale) ? locale : "fr";
}

function summary(results: PageImportResult[]) {
  const count = (status: PageImportResult["status"]) => results.filter((r) => r.status === status).length;
  return { results, created: count("created"), updated: count("updated"), skipped: count("skipped"), failed: count("failed") };
}

// GET /page/import/theme?locale=fr — the active theme's pages, and which
// of them already exist on the site.
export const listThemePages = async (req: Request, res: Response) => {
  try {
    const theme = activeThemeDir();
    if (!theme) return res.json({ theme: null, pages: [] });
    const locale = typeof req.query.locale === "string" && /^[a-z]{2}$/.test(req.query.locale) ? req.query.locale : "fr";
    const entries = readThemePages(theme.dir);
    const existing = await prisma.page.findMany({
      where: { locale, slug: { in: entries.map((e) => e.slug) } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((p: { slug: string }) => p.slug));
    res.json({
      theme: { id: theme.id, name: theme.name },
      pages: entries.map((e) => ({
        slug: e.slug,
        title: e.page?.title ?? null,
        blocks: e.page?.body.length ?? 0,
        exists: existingSlugs.has(e.slug),
        error: e.error ?? null,
      })),
    });
  } catch (err) {
    console.error("Erreur lors de la lecture des pages du thème :", err);
    res.status(500).json({ message: "Impossible de lire les pages du thème." });
  }
};

// POST /page/import/theme { slugs?: string[], overwrite?: boolean, locale? }
// — imports the active theme's pages (all of them when `slugs` is omitted).
export const importThemePages = async (req: Request, res: Response) => {
  try {
    const theme = activeThemeDir();
    if (!theme) return res.status(404).json({ message: "Aucun thème installé : seul le thème par défaut est actif." });
    const wanted = Array.isArray(req.body?.slugs) ? new Set(req.body.slugs.map(String)) : null;
    const pages = readThemePages(theme.dir)
      .filter((e) => !wanted || wanted.has(e.slug))
      .flatMap((e) => (e.page ? [e.page] : []));
    const results = await importPages(pages, { overwrite: req.body?.overwrite === true, locale: requestLocale(req) });
    res.json(summary(results));
  } catch (err) {
    console.error("Erreur lors de l'import des pages du thème :", err);
    res.status(500).json({ message: "Erreur lors de l'import des pages du thème." });
  }
};

// POST /page/import { pages: [{ fileName?, slug?, title, body }], overwrite?, locale? }
// — pages from uploaded JSON files (the browser reads them and sends their
// content); a file without "slug" takes its file name as the address.
export const importUploadedPages = async (req: Request, res: Response) => {
  const items = req.body?.pages;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Aucune page à importer." });
  }
  if (items.length > MAX_PAGES) {
    return res.status(400).json({ message: `Trop de pages en une fois (maximum ${MAX_PAGES}).` });
  }

  const valid: PageData[] = [];
  const invalid: PageImportResult[] = [];
  for (const item of items) {
    const fileName = typeof item?.fileName === "string" ? item.fileName : "";
    const fallbackSlug = fileName.replace(/\.json$/i, "");
    try {
      valid.push(parsePageData(item?.data ?? item, fallbackSlug));
    } catch (err) {
      invalid.push({ slug: fallbackSlug || "?", status: "failed", error: (err as Error).message });
    }
  }

  try {
    const results = await importPages(valid, { overwrite: req.body?.overwrite === true, locale: requestLocale(req) });
    res.json(summary([...results, ...invalid]));
  } catch (err) {
    console.error("Erreur lors de l'import des pages :", err);
    res.status(500).json({ message: "Erreur lors de l'import des pages." });
  }
};
