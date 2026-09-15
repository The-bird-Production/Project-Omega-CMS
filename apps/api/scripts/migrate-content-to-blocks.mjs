#!/usr/bin/env node
// One-time migration: converts every page/article/articleSaved's `body`
// from raw TinyMCE HTML to a JSON-stringified BlockNote block array, now
// that content is edited with the block editor instead. Safe to re-run —
// a row whose body already parses as a block array is left untouched, so
// running this twice (or against a database with some already-migrated
// rows, e.g. after a partial failure) just skips what's already done.
//
// Run manually once after deploying the block-editor change:
//   node apps/api/scripts/migrate-content-to-blocks.mjs
import { prisma } from "@omega/db";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

export function isAlreadyMigrated(body) {
  if (!body) return true; // nothing to convert
  try {
    const parsed = JSON.parse(body);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}

export async function migrateRows(modelName, rows, updateOne, parseHTMLToBlocks) {
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    if (isAlreadyMigrated(row.body)) {
      skipped++;
      continue;
    }
    try {
      const blocks = await parseHTMLToBlocks(row.body);
      await updateOne(row.id, JSON.stringify(blocks));
      migrated++;
    } catch (err) {
      failed++;
      console.error(`[${modelName}#${row.id}] Échec de la conversion :`, err);
    }
  }

  console.log(`${modelName}: ${migrated} converti(s), ${skipped} déjà migré(s)/vide(s), ${failed} échec(s).`);
  return failed;
}

async function main() {
  const editor = ServerBlockNoteEditor.create();
  const parseHTMLToBlocks = (html) => editor.tryParseHTMLToBlocks(html);
  let failures = 0;

  const pages = await prisma.page.findMany({ select: { id: true, body: true } });
  failures += await migrateRows(
    "page",
    pages,
    (id, body) => prisma.page.update({ where: { id }, data: { body } }),
    parseHTMLToBlocks
  );

  const articles = await prisma.article.findMany({ select: { id: true, body: true } });
  failures += await migrateRows(
    "article",
    articles,
    (id, body) => prisma.article.update({ where: { id }, data: { body } }),
    parseHTMLToBlocks
  );

  const drafts = await prisma.articleSaved.findMany({ select: { id: true, body: true } });
  failures += await migrateRows(
    "articleSaved",
    drafts,
    (id, body) => prisma.articleSaved.update({ where: { id }, data: { body } }),
    parseHTMLToBlocks
  );

  await prisma.$disconnect();
  process.exit(failures > 0 ? 1 : 0);
}

// Only auto-run when executed directly (`node migrate-content-to-blocks.mjs`),
// not when imported by tests.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch(async (err) => {
    console.error("Erreur inattendue :", err);
    await prisma.$disconnect();
    process.exit(1);
  });
}
