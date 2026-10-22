import fs from "fs";
import path from "path";
import { prisma } from "@omega/db";
import { revalidateWebPaths } from "./RevalidateWeb.js";

// Pages in the theme content format: content/pages/<slug>.json in a theme,
// each { title, body } where body is the block array the editor itself
// produces (see apps/web/lib/blocks/). Used when a theme is installed
// (seed missing pages) and from the admin (Pages → Importer: re-import a
// theme's pages, or upload such JSON files), so all of them follow the
// same rules.

export interface PageData {
  slug: string;
  title: string;
  body: unknown[];
}

export type PageImportStatus = "created" | "updated" | "skipped" | "failed";

export interface PageImportResult {
  slug: string;
  title?: string;
  status: PageImportStatus;
  error?: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Validates one page. `fallbackSlug` is the file name without .json, used
// when the JSON has no "slug" of its own (theme files don't: the file name
// is the slug).
export function parsePageData(raw: unknown, fallbackSlug?: string): PageData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Le fichier doit contenir un objet { title, body }.");
  const data = raw as Record<string, unknown>;
  const slug = String(typeof data.slug === "string" && data.slug.trim() ? data.slug : fallbackSlug ?? "")
    .trim()
    .toLowerCase();
  if (!SLUG_RE.test(slug)) throw new Error(`Adresse de page invalide : « ${slug || "(vide)"} » (lettres minuscules, chiffres et tirets).`);
  if (typeof data.title !== "string" || !data.title.trim()) throw new Error("Titre manquant (« title »).");
  if (!Array.isArray(data.body)) throw new Error("Contenu manquant : « body » doit être une liste de blocs.");
  return { slug, title: data.title.trim(), body: data.body };
}

// The active theme's folder (same rule as /themes/current: the one
// non-default folder with a theme.json), or null with only "default".
export function activeThemeDir(themesDir = path.resolve(process.cwd(), "Themes")): { id: string; name: string; dir: string } | null {
  if (!fs.existsSync(themesDir)) return null;
  for (const id of fs.readdirSync(themesDir)) {
    if (id.toLowerCase() === "default") continue;
    const manifestPath = path.join(themesDir, id, "theme.json");
    if (!fs.existsSync(manifestPath)) continue;
    let name = id;
    try {
      name = JSON.parse(fs.readFileSync(manifestPath, "utf-8")).name || id;
    } catch {
      // Unreadable manifest: keep the folder name.
    }
    return { id, name, dir: path.join(themesDir, id) };
  }
  return null;
}

// Every content/pages/*.json of a theme folder, each parsed or with the
// reason it can't be imported.
export function readThemePages(themeDir: string): Array<{ slug: string; page?: PageData; error?: string }> {
  const pagesDir = path.join(themeDir, "content", "pages");
  if (!fs.existsSync(pagesDir)) return [];
  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const fallbackSlug = file.slice(0, -".json".length);
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(pagesDir, file), "utf-8"));
        return { slug: fallbackSlug, page: parsePageData(raw, fallbackSlug) };
      } catch (err) {
        return { slug: fallbackSlug, error: (err as Error).message };
      }
    });
}

// Creates each page, or for one that already exists at that address in
// that locale: replaces its title and content when `overwrite`, otherwise
// leaves it alone (an owner's edits are never lost by default).
export async function importPages(
  pages: PageData[],
  { overwrite = false, locale = "fr" }: { overwrite?: boolean; locale?: string } = {}
): Promise<PageImportResult[]> {
  const results: PageImportResult[] = [];
  for (const page of pages) {
    try {
      const existing = await prisma.page.findUnique({
        where: { slug_locale: { slug: page.slug, locale } },
        select: { id: true },
      });
      if (existing && !overwrite) {
        results.push({ slug: page.slug, title: page.title, status: "skipped" });
        continue;
      }
      const body = JSON.stringify(page.body);
      if (existing) {
        await prisma.page.update({ where: { id: existing.id }, data: { title: page.title, body } });
      } else {
        await prisma.page.create({ data: { slug: page.slug, locale, title: page.title, body } });
      }
      results.push({ slug: page.slug, title: page.title, status: existing ? "updated" : "created" });
    } catch (err) {
      console.error(`Impossible d'importer la page "${page.slug}" :`, err);
      results.push({ slug: page.slug, title: page.title, status: "failed", error: (err as Error).message });
    }
  }

  const changed = results.filter((r) => r.status === "created" || r.status === "updated");
  if (changed.length > 0) {
    await revalidateWebPaths(changed.map((r) => ({ slug: r.slug, locale }))).catch(() => {});
  }
  return results;
}
