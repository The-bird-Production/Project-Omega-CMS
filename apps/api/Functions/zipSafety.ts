import path from "path";
import type AdmZip from "adm-zip";

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
