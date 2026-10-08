#!/usr/bin/env node
// Imports the published articles of another (older) Project Omega
// instance into this one — e.g. moving a site's content over to a fresh
// install of the new version instead of migrating the old database in
// place. For each article of the source:
//   - its HTML body (old TinyMCE editor) is converted to blocks, like
//     migrate-content-to-blocks.mjs does for an in-place migration;
//   - every image it shows is downloaded from the source and added to
//     this instance's image library (Public/Images + `image` table), and
//     the body is rewritten to point at the local copy — the article no
//     longer depends on the old site staying online;
//   - title, slug, publication date are kept as-is.
// Idempotent: an article whose slug (or title) already exists here is
// skipped, so re-running after an interruption only imports what's left.
//
// Usage (from apps/api, or `docker compose exec omega-server pnpm --filter
// @omega/api run import-articles -- ...`):
//   pnpm run import-articles -- --source https://backend.ancien-site.fr \
//     [--author admin@example.com] [--backend-url https://api.nouveau-site.fr] [--dry-run]
//
//   --source       URL of the OLD site's API (its backend, not its public
//                  site), e.g. https://backend-omega.aupieddumorclan.fr
//   --author       email of the local user the articles are attributed to
//                  (default: the oldest admin account)
//   --backend-url  public URL of THIS instance's API, used in imported image
//                  URLs (default: BACKEND_URL from apps/api/.env)
//   --dry-run      fetch and convert everything, print a summary, but write
//                  nothing (no file, no database row)
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

const IMAGE_DIR = path.resolve(process.cwd(), "Public/Images");
const IMAGE_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export function parseArgs(argv) {
  const opts = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--source") opts.source = argv[++i];
    else if (arg === "--author") opts.author = argv[++i];
    else if (arg === "--backend-url") opts.backendUrl = argv[++i];
    else if (arg !== "--") throw new Error(`Option inconnue : ${arg}`);
  }
  return opts;
}

// Word/Outlook-pasted content (very common in the old TinyMCE bodies)
// carries Office-namespaced tags (<o:p>, <v:shape>...) and conditional
// comments that mean nothing outside Office — drop them before parsing
// so they don't turn into stray empty paragraphs.
export function cleanLegacyHtml(html) {
  return (html || "")
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    .replace(/<\/?[ovw]:[^>]*>/gi, "")
    .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
}

// The old editor nested images inside paragraphs (<p><strong><span><img>),
// which the block parser drops or keeps as text-only paragraphs: hoist
// each <img> to its own top-level position so it becomes an image block.
export function hoistImages(html) {
  return html.replace(/<p\b[^>]*>((?:(?!<\/p>)[\s\S])*?)<\/p>/gi, (para, inner) => {
    const imgs = inner.match(/<img\b[^>]*>/gi);
    if (!imgs) return para;
    const rest = inner.replace(/<img\b[^>]*>/gi, "");
    const hasText = rest.replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "") !== "";
    return imgs.join("") + (hasText ? `<p>${rest}</p>` : "");
  });
}

export function collectImageSources(html) {
  const sources = new Set();
  for (const match of html.matchAll(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi)) {
    sources.add(match[1]);
  }
  return [...sources];
}

export function replaceImageSources(html, mapping) {
  return html.replace(/(<img\b[^>]*?\ssrc\s*=\s*["'])([^"']+)(["'])/gi, (all, before, src, after) =>
    mapping.has(src) ? `${before}${mapping.get(src)}${after}` : all
  );
}

async function fetchSourceArticles(source) {
  const res = await fetch(`${source}/article/get/all`);
  // The old API answers 404 (not an empty list) when there's no article.
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`${source}/article/get/all a répondu ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  const extension = IMAGE_EXTENSIONS[type];
  if (!extension) throw new Error(`type non pris en charge (${type || "inconnu"})`);
  return { buffer: Buffer.from(await res.arrayBuffer()), extension };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.source) {
    console.error("Usage : pnpm run import-articles -- --source <URL de l'API de l'ancien site> [--author email] [--backend-url URL] [--dry-run]");
    process.exit(1);
  }
  const source = opts.source.replace(/\/+$/, "");
  const backendUrl = (opts.backendUrl || process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!backendUrl && !opts.dryRun) {
    console.error("URL publique de l'API introuvable : passez --backend-url ou définissez BACKEND_URL dans apps/api/.env.");
    process.exit(1);
  }

  // Imported lazily so --help-like failures above don't need a database.
  const { prisma } = await import("@omega/db");
  const { ServerBlockNoteEditor } = await import("@blocknote/server-util");
  const editor = ServerBlockNoteEditor.create();

  // A dry run is also meant to preview an import before the new instance
  // is even fully set up — without a reachable database it still fetches
  // and converts everything, it just can't tell what's already imported.
  let db = prisma;
  let author;
  try {
    author = opts.author
      ? await prisma.user.findFirst({ where: { email: opts.author } })
      : await prisma.user.findFirst({ where: { role: "admin" }, orderBy: { createdAt: "asc" } });
  } catch (err) {
    if (!opts.dryRun) throw err;
    console.warn(`Base de données inaccessible (${err.message.trim().split("\n").pop()}) : simulation sans vérification des doublons.`);
    db = null;
  }
  if (db && !author) {
    console.error(opts.author ? `Aucun utilisateur avec l'e-mail ${opts.author}.` : "Aucun administrateur trouvé : passez --author <email>.");
    await prisma.$disconnect();
    process.exit(1);
  }

  const articles = await fetchSourceArticles(source);
  console.log(`${articles.length} article(s) trouvé(s) sur ${source}${opts.dryRun ? " (simulation, rien ne sera écrit)" : ""}.`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let imageCount = 0;
  const imageFailures = [];

  for (const article of articles) {
    const label = `« ${article.title} » (${article.slug})`;
    try {
      const existing = db && await db.article.findFirst({
        where: { locale: "fr", OR: [{ slug: article.slug }, { title: article.title }] },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        console.log(`- ${label} : déjà présent, ignoré.`);
        continue;
      }

      let html = hoistImages(cleanLegacyHtml(article.body));

      // Download each image and point the body at the local copy. An image
      // that can't be fetched keeps its old URL (and is reported) rather
      // than failing the whole article.
      const mapping = new Map();
      for (const src of collectImageSources(html)) {
        const absolute = new URL(src, `${source}/`).toString();
        try {
          const { buffer, extension } = await downloadImage(absolute);
          const file = randomBytes(16).toString("hex") + extension;
          if (!opts.dryRun) {
            await fs.mkdir(IMAGE_DIR, { recursive: true });
            await fs.writeFile(path.join(IMAGE_DIR, file), buffer);
            await prisma.image.create({
              data: { title: article.title, alt: article.title, file, slug: file },
            });
          }
          mapping.set(src, `${backendUrl}/image/${file}`);
          imageCount++;
        } catch (err) {
          imageFailures.push(`${absolute} (${label}) : ${err.message}`);
        }
      }
      html = replaceImageSources(html, mapping);

      const blocks = await editor.tryParseHTMLToBlocks(html);
      const coverImage = article.image ? mapping.get(article.image) ?? article.image : null;

      if (!opts.dryRun) {
        await prisma.article.create({
          data: {
            title: article.title,
            slug: article.slug,
            locale: "fr",
            body: JSON.stringify(blocks),
            image: coverImage,
            authorId: author.id,
            createdAt: article.createdAt ? new Date(article.createdAt) : undefined,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          },
        });
      }
      imported++;
      console.log(`+ ${label} : ${blocks.length} bloc(s), ${mapping.size} image(s).`);
    } catch (err) {
      failed++;
      console.error(`! ${label} : échec de l'import —`, err);
    }
  }

  console.log(
    `\nTerminé : ${imported} importé(s)${opts.dryRun ? " (simulation)" : ""}, ${skipped} déjà présent(s), ${failed} échec(s), ${imageCount} image(s) récupérée(s).`
  );
  if (imageFailures.length > 0) {
    console.log(`${imageFailures.length} image(s) n'ont pas pu être récupérées (l'ancienne URL est conservée) :`);
    for (const line of imageFailures) console.log(`  - ${line}`);
  }

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

// Only auto-run when executed directly, not when imported by tests.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch((err) => {
    console.error("Erreur inattendue :", err);
    process.exit(1);
  });
}
