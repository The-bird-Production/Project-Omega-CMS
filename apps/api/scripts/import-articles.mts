#!/usr/bin/env node
// Command-line version of the admin panel's "Importer des articles" page
// (Articles → Importer) — see lib/articleImport.ts for what an import
// does. Handy for a large site (no HTTP timeout) or from a shell/SSH.
//
// Usage (from apps/api, or `docker compose exec omega-server pnpm run
// import-articles -- ...`):
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

interface CliOptions {
  source?: string;
  author?: string;
  backendUrl?: string;
  dryRun: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { dryRun: false };
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

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.source) {
    console.error("Usage : pnpm run import-articles -- --source <URL de l'API de l'ancien site> [--author email] [--backend-url URL] [--dry-run]");
    process.exit(1);
  }
  const backendUrl = opts.backendUrl || process.env.BACKEND_URL || "";
  if (!backendUrl && !opts.dryRun) {
    console.error("URL publique de l'API introuvable : passez --backend-url ou définissez BACKEND_URL dans apps/api/.env.");
    process.exit(1);
  }

  // Imported lazily so the usage errors above don't need a database.
  const { prisma } = await import("@omega/db");
  const { importArticles } = await import("../lib/articleImport.js");

  let authorId: string | undefined;
  try {
    const author = opts.author
      ? await prisma.user.findFirst({ where: { email: opts.author } })
      : await prisma.user.findFirst({ where: { role: "admin" }, orderBy: { createdAt: "asc" } });
    if (!author) {
      console.error(opts.author ? `Aucun utilisateur avec l'e-mail ${opts.author}.` : "Aucun administrateur trouvé : passez --author <email>.");
      await prisma.$disconnect();
      process.exit(1);
    }
    authorId = author.id;
  } catch (err) {
    if (!opts.dryRun) throw err;
  }

  const report = await importArticles({
    source: opts.source,
    backendUrl,
    authorId,
    dryRun: opts.dryRun,
    log: (line) => console.log(line),
  });

  console.log(
    `\nTerminé : ${report.imported} importé(s)${report.dryRun ? " (simulation)" : ""}, ${report.skipped} déjà présent(s), ${report.failed} échec(s), ${report.imageCount} image(s) récupérée(s).`
  );
  if (report.imageFailures.length > 0) {
    console.log(`${report.imageFailures.length} image(s) n'ont pas pu être récupérées (l'ancienne URL est conservée) :`);
    for (const line of report.imageFailures) console.log(`  - ${line}`);
  }

  await prisma.$disconnect();
  process.exit(report.failed > 0 ? 1 : 0);
}

// Only auto-run when executed directly, not when imported by tests.
if (process.argv[1] && /import-articles\.mts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error("Erreur inattendue :", err);
    process.exit(1);
  });
}
