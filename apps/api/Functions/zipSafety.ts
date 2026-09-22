import fs from "fs";
import path from "path";
import type AdmZip from "adm-zip";

// fs.renameSync only works within a single filesystem/device — it throws
// EXDEV when the source and destination straddle a mount boundary, which
// is exactly what happens moving an extracted release from temp/ (the
// container's own writable layer) into Themes/ or Plugins/ (bind-mounted
// host directories) under Docker. Falls back to an explicit copy + remove,
// which works across devices, only when that specific error occurs.
export function movePath(src: string, dest: string): void {
  try {
    fs.renameSync(src, dest);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
  }
}

// A theme/plugin installed after apps/web's production server was already
// built is invisible to it — every dynamic import of a theme/plugin file
// has its set of possible targets baked in at `next build` time (see
// apps/web/lib/pageTemplates/render.js's comment for how this was
// confirmed). apps/web's scripts/supervisor.mjs polls Themes/ (the same
// directory this writes into, already bind-mounted into both containers,
// see docker-compose.yml) for this file and rebuilds+restarts itself when
// it appears, so a theme/plugin actually takes effect without the
// operator having to notice and restart it by hand. Docker-only: a
// bare-metal deployment has no separate client process for this file to
// signal, and rebuilds when its operator next restarts their own process.
export function requestClientRebuild(themesDir: string): void {
  try {
    fs.writeFileSync(path.join(themesDir, ".rebuild-requested"), new Date().toISOString());
  } catch (err) {
    console.error("Impossible de demander la reconstruction du client :", err);
  }
}

// Throws if targetPath does not resolve to a location inside baseDir (path traversal / zip-slip guard).
export function assertInside(baseDir: string, targetPath: string, label: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  if (resolvedTarget !== resolvedBase && !resolvedTarget.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Chemin ${label} hors dossier autorisé : ${resolvedTarget}`);
  }
  return resolvedTarget;
}

// Every zip entry must resolve inside extractDir before extractAllTo() ever
// runs — a crafted entry name like "../../../etc/cron.d/x" would otherwise
// write outside the intended extraction directory.
export function assertSafeZipEntries(zip: Pick<AdmZip, "getEntries">, extractDir: string): void {
  for (const entry of zip.getEntries()) {
    assertInside(extractDir, path.join(extractDir, entry.entryName), "d'entrée d'archive");
  }
}
