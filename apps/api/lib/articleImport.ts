// Imports the published articles of another (older) Project Omega
// instance into this one — e.g. moving a site's content over to a fresh
// install of the new version instead of migrating the old database in
// place. Shared by the admin panel (POST /article/import, see
// Controllers/Article/ImportController.ts) and the command-line script
// (scripts/import-articles.mts). For each article of the source:
//   - its HTML body (old TinyMCE editor) is converted to blocks, like
//     migrate-content-to-blocks.mjs does for an in-place migration;
//   - every image it shows is downloaded from the source and added to
//     this instance's image library (Public/Images + `image` table), and
//     the body is rewritten to point at the local copy — the article no
//     longer depends on the old site staying online;
//   - title, slug, publication date are kept as-is.
// Idempotent: an article whose slug (or title) already exists here is
// skipped, so re-running after an interruption only imports what's left.
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { prisma } from "@omega/db";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

const IMAGE_DIR = path.resolve(process.cwd(), "Public/Images");
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export type ImportedArticleStatus = "imported" | "skipped" | "failed";

export interface ImportReport {
  dryRun: boolean;
  /** false when a dry run couldn't reach the database (duplicates not checked). */
  checkedExisting: boolean;
  articles: { title: string; slug: string; status: ImportedArticleStatus; blocks?: number; images?: number; error?: string }[];
  imported: number;
  skipped: number;
  failed: number;
  imageCount: number;
  imageFailures: string[];
}

export interface ImportOptions {
  source: string;
  /** Public URL of THIS instance's API, used in imported image URLs. */
  backendUrl: string;
  /** Local user the articles are attributed to. */
  authorId?: string;
  dryRun?: boolean;
  log?: (line: string) => void;
}

// Word/Outlook-pasted content (very common in the old TinyMCE bodies)
// carries Office-namespaced tags (<o:p>, <v:shape>...) and conditional
// comments that mean nothing outside Office — drop them before parsing
// so they don't turn into stray empty paragraphs.
export function cleanLegacyHtml(html: string | null | undefined): string {
  return (html || "")
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<\/?[ovw]:[^>]*>/gi, "")
    .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
}

// The old editor nested images inside paragraphs (<p><strong><span><img>):
// hoist each <img> to its own top-level position so it reliably becomes
// an image block rather than depending on how the parser handles it.
export function hoistImages(html: string): string {
  return html.replace(/<p\b[^>]*>((?:(?!<\/p>)[\s\S])*?)<\/p>/gi, (para, inner: string) => {
    const imgs = inner.match(/<img\b[^>]*>/gi);
    if (!imgs) return para;
    const rest = inner.replace(/<img\b[^>]*>/gi, "");
    const hasText = rest.replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "") !== "";
    return imgs.join("") + (hasText ? `<p>${rest}</p>` : "");
  });
}

export function collectImageSources(html: string): string[] {
  const sources = new Set<string>();
  for (const match of html.matchAll(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi)) {
    sources.add(match[1]);
  }
  return [...sources];
}

export function replaceImageSources(html: string, mapping: Map<string, string>): string {
  return html.replace(/(<img\b[^>]*?\ssrc\s*=\s*["'])([^"']+)(["'])/gi, (all, before, src, after) =>
    mapping.has(src) ? `${before}${mapping.get(src)}${after}` : all
  );
}

// Only http(s) URLs — this is fetched server-side on an admin's request.
export function normalizeSourceUrl(source: string): string {
  const url = new URL((source || "").trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("L'URL doit commencer par http:// ou https://");
  return url.toString().replace(/\/+$/, "");
}

interface SourceArticle {
  title: string;
  slug: string;
  body: string | null;
  image?: string | null;
  createdAt?: string;
  publishedAt?: string;
}

async function fetchSourceArticles(source: string): Promise<SourceArticle[]> {
  const res = await fetch(`${source}/article/get/all`);
  // The old API answers 404 (not an empty list) when there's no article.
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`${source}/article/get/all a répondu ${res.status}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error(`${source} ne ressemble pas à l'API d'un site Project Omega (réponse non JSON).`);
  }
  const list = Array.isArray(json) ? json : (json as { data?: unknown }).data;
  if (!Array.isArray(list)) throw new Error(`${source} ne ressemble pas à l'API d'un site Project Omega.`);
  return list as SourceArticle[];
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; extension: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  const extension = IMAGE_EXTENSIONS[type];
  if (!extension) throw new Error(`type non pris en charge (${type || "inconnu"})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("image trop volumineuse");
  return { buffer, extension };
}

export async function importArticles(opts: ImportOptions): Promise<ImportReport> {
  const log = opts.log ?? (() => {});
  const dryRun = !!opts.dryRun;
  const source = normalizeSourceUrl(opts.source);
  const backendUrl = opts.backendUrl.replace(/\/+$/, "");
  if (!dryRun && !opts.authorId) throw new Error("Auteur des articles importés manquant.");

  const report: ImportReport = {
    dryRun,
    checkedExisting: true,
    articles: [],
    imported: 0,
    skipped: 0,
    failed: 0,
    imageCount: 0,
    imageFailures: [],
  };

  const editor = ServerBlockNoteEditor.create();
  const articles = await fetchSourceArticles(source);
  log(`${articles.length} article(s) trouvé(s) sur ${source}${dryRun ? " (simulation, rien ne sera écrit)" : ""}.`);

  for (const article of articles) {
    const label = `« ${article.title} » (${article.slug})`;
    try {
      let existing = null;
      if (report.checkedExisting) {
        try {
          existing = await prisma.article.findFirst({
            where: { locale: "fr", OR: [{ slug: article.slug }, { title: article.title }] },
            select: { id: true },
          });
        } catch (err) {
          // A dry run is also meant to preview an import before the new
          // instance is fully set up: without a database it still fetches
          // and converts everything, it just can't spot duplicates.
          if (!dryRun) throw err;
          report.checkedExisting = false;
          log(`Base de données inaccessible : simulation sans vérification des doublons.`);
        }
      }
      if (existing) {
        report.skipped++;
        report.articles.push({ title: article.title, slug: article.slug, status: "skipped" });
        log(`- ${label} : déjà présent, ignoré.`);
        continue;
      }

      let html = hoistImages(cleanLegacyHtml(article.body));

      // Download each image and point the body at the local copy. An image
      // that can't be fetched keeps its old URL (and is reported) rather
      // than failing the whole article.
      const mapping = new Map<string, string>();
      for (const src of collectImageSources(html)) {
        const absolute = new URL(src, `${source}/`).toString();
        try {
          const { buffer, extension } = await downloadImage(absolute);
          const file = randomBytes(16).toString("hex") + extension;
          if (!dryRun) {
            await fs.mkdir(IMAGE_DIR, { recursive: true });
            await fs.writeFile(path.join(IMAGE_DIR, file), buffer);
            await prisma.image.create({
              data: { title: article.title, alt: article.title, file, slug: file },
            });
          }
          mapping.set(src, `${backendUrl}/image/${file}`);
          report.imageCount++;
        } catch (err) {
          report.imageFailures.push(`${absolute} (${label}) : ${(err as Error).message}`);
        }
      }
      html = replaceImageSources(html, mapping);

      const blocks = await editor.tryParseHTMLToBlocks(html);
      const coverImage = article.image ? mapping.get(article.image) ?? article.image : null;

      if (!dryRun) {
        await prisma.article.create({
          data: {
            title: article.title,
            slug: article.slug,
            locale: "fr",
            body: JSON.stringify(blocks),
            image: coverImage,
            authorId: opts.authorId as string,
            createdAt: article.createdAt ? new Date(article.createdAt) : undefined,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          },
        });
      }
      report.imported++;
      report.articles.push({ title: article.title, slug: article.slug, status: "imported", blocks: blocks.length, images: mapping.size });
      log(`+ ${label} : ${blocks.length} bloc(s), ${mapping.size} image(s).`);
    } catch (err) {
      report.failed++;
      report.articles.push({ title: article.title, slug: article.slug, status: "failed", error: (err as Error).message });
      log(`! ${label} : échec de l'import — ${(err as Error).message}`);
    }
  }

  return report;
}
