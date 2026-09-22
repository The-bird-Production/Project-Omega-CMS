import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import type { Application, Router } from "express";
import { prisma } from "@omega/db";
import { fileURLToPath } from "url";
import { loadPlugin } from "./LoadPlugin.js";
import { warn } from "console";
import { assertSafeZipEntries, movePath, requestClientRebuild } from "./zipSafety.js";
import { parseRepoInput, fetchLatestRelease, downloadReleaseArchive, unwrapSingleTopLevelDir, repoToLocalId } from "./githubRelease.js";
import { isSafePluginId } from "./pluginIdValidator.js";
import { isRunningInDocker } from "./Updater/gitState.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// repo: a GitHub "owner/repo" (or full github.com URL) whose latest release
// is downloaded and installed as a plugin. The local plugin id is always
// derived from the repo, deterministically, so re-installing (update=true)
// the same repo lands on the same plugin directory/DB row.
export const InstallPlugins = async (repo: string, app: Application | Router, update: boolean): Promise<void> => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    // A bare-metal checkout has apps/web right next to apps/api, so the
    // monorepo-relative path resolves for real. The omega-server Docker
    // image only ever contains apps/api (see apps/api/Dockerfile — it
    // never COPYs apps/web in), so that same relative path would silently
    // resolve to a location with no apps/web behind it at all: this used
    // to write a plugin's dashboard.js/blocks.js into a directory the
    // omega-client container could never see and that Docker never
    // persisted (recreated on every restart) — the file went nowhere.
    // PluginsClient is bind-mounted the same way Themes/Themes_style
    // already are: one host directory, mounted into both containers at
    // each one's own expected path (see docker-compose.yml).
    const clientDir = isRunningInDocker()
        ? path.resolve(process.cwd(), "PluginsClient")
        : path.resolve(__dirname, "../../../apps/web/app/components/plugin");
    const tempDir = path.resolve(process.cwd(), "temp");
    const BACKUP_DIR = path.resolve(process.cwd(), "backups");

    const normalizedRepo = parseRepoInput(repo);
    // path.basename() is a no-op here in practice (repoToLocalId already
    // never produces "/"), but makes the sanitization explicit at the exact
    // value every filesystem path below is built from.
    const safePluginName = path.basename(repoToLocalId(normalizedRepo));

    try {
        if (!isSafePluginId(safePluginName)) {
            throw new Error("Plugin ID invalide ou non autorisé.");
        }

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

        const release = await fetchLatestRelease(normalizedRepo);
        if (!release) {
            throw new Error(`Aucune release trouvée pour ${normalizedRepo}. Le dépôt doit avoir au moins une release GitHub.`);
        }

        console.log(`Téléchargement du plugin depuis ${normalizedRepo} (${release.tagName})`);
        const extractPath = path.join(tempDir, safePluginName);

        const { zip, needsUnwrap } = await downloadReleaseArchive(release, "plugin.zip");
        // Zip-slip guard: every entry must resolve inside extractPath before
        // extraction ever runs — this was previously missing here entirely
        // (unlike the theme installer), so a crafted plugin archive could
        // write files anywhere the process had permissions for.
        assertSafeZipEntries(zip, extractPath);
        zip.extractAllTo(extractPath, true);
        if (needsUnwrap) unwrapSingleTopLevelDir(extractPath);

        // ✅ Construction et vérification de confinement pour pluginDir (ligne ~43)
        const pluginDir = path.resolve(pluginsDir, safePluginName);
        if (!pluginDir.startsWith(pluginsDir)) {  // Confinement check
            throw new Error(`Chemin de plugin hors dossier autorisé : ${pluginDir}`);
        }

        const safePluginDir = path.join(pluginsDir, safePluginName);  // Redondant mais cohérent
        if (!safePluginDir.startsWith(pluginsDir)) {
            throw new Error(`Chemin safe hors dossier autorisé.`);
        }

        if (fs.existsSync(safePluginDir)) fs.rmSync(safePluginDir, { recursive: true, force: true });
        movePath(extractPath, safePluginDir);

        // ✅ Vérification pour clientDir
        const safeClientPluginDir = path.join(clientDir, safePluginName);
        if (!safeClientPluginDir.startsWith(clientDir)) {
            throw new Error(`Chemin client hors dossier autorisé.`);
        }

        if (!update && !fs.existsSync(safeClientPluginDir)) {
            fs.mkdirSync(safeClientPluginDir, { recursive: true });
        }

        const dashboardFile = path.join(safePluginDir, "admin", "dashboard.js");
        const publicComponent = path.join(safePluginDir, "public", "publicComponent.js");
        // A plugin's block-editor contribution (see apps/web/lib/blocks/README.md)
        // — optional, same as the two files above.
        const blocksFile = path.join(safePluginDir, "public", "blocks.js");

        if (fs.existsSync(dashboardFile)) {
            movePath(dashboardFile, path.join(safeClientPluginDir, "dashboard.js"));
        }

        if (fs.existsSync(publicComponent)) {
            movePath(publicComponent, path.join(safeClientPluginDir, "publicComponent.js"));
        }

        if (fs.existsSync(blocksFile)) {
            movePath(blocksFile, path.join(safeClientPluginDir, "blocks.js"));
        }

        // ✅ Suppression sécurisée (ajoutez check si besoin)
        const adminDir = path.join(safePluginDir, "admin");
        const publicDir = path.join(safePluginDir, "public");
        if (adminDir.startsWith(safePluginDir)) {
            fs.rmSync(adminDir, { recursive: true, force: true });
        }
        if (publicDir.startsWith(safePluginDir)) {
            fs.rmSync(publicDir, { recursive: true, force: true });
        }

        console.log("✅ Dossier du plugin déplacé avec succès");

        // ✅ Sauvegarde base de données (déjà bonne, mais optionnel : promisify execFile)
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) throw new Error("DATABASE_URL non défini dans les variables d'environnement.");

        const db = new URL(DATABASE_URL);
        const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFilePath = path.join(BACKUP_DIR, `backup_${backupTimestamp}.sql`);
        if (!backupFilePath.startsWith(BACKUP_DIR)) {
            throw new Error("Chemin de backup hors dossier autorisé.");
        }

        if (process.env.NODE_ENV !== "development") {
            await new Promise<void>((resolve, reject) => {
                execFile(
                    "mysqldump",
                    ["-u", db.username, "-h", db.hostname, "-P", db.port || "3306", db.pathname.replace("/", "")],
                    // Password passed via env (MYSQL_PWD) instead of argv so it never appears in `ps`/process listings.
                    { maxBuffer: 1024 * 1024 * 10, env: { ...process.env, MYSQL_PWD: db.password } },
                    (error, stdout, stderr) => {
                        if (error || stderr) {
                            console.error("Erreur de sauvegarde MySQL :", error || stderr);
                            return reject(error || new Error(stderr));
                        }
                        fs.writeFileSync(backupFilePath, stdout);
                        console.log(`✅ Sauvegarde effectuée : ${backupFilePath}`);
                        resolve();
                    }
                );
            });
        }

        // ✅ Application de la migration (amélioration : validez le SQL si possible)
        const migrationPath = path.join(safePluginDir, "prisma", "migration.sql");
        if (!migrationPath.startsWith(safePluginDir)) {
            throw new Error("Chemin de migration hors dossier autorisé.");
        }
        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
            if (migrationSQL.trim()) {
                // ⚠️ Pour plus de sécurité : Validez que c'est du SQL sûr (ex. regex pour CREATE/ALTER seulement)
                // Exemple basique : if (!/^(CREATE|ALTER|INSERT|UPDATE|DELETE)/i.test(migrationSQL)) { throw new Error("SQL invalide"); }
                await prisma.$executeRawUnsafe(migrationSQL);  // Gardez si plugins trusted
            } else {
                warn("Fichier de migration vide, ignoré.");
            }
        } else {
            warn("Aucun fichier de migration trouvé.");
        }

        // Suivi en base pour que l'admin/l'updater sachent ce qui est installé sans
        // relire tous les plugin.json — best-effort, ne doit pas faire échouer l'install.
        try {
            const manifestPath = path.join(safePluginDir, "plugin.json");
            const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : {};
            await prisma.plugin.upsert({
                where: { pluginId: safePluginName },
                create: {
                    pluginId: safePluginName,
                    name: manifest.name ?? safePluginName,
                    version: release.tagName,
                    source: `github:${normalizedRepo}`,
                },
                update: {
                    name: manifest.name ?? safePluginName,
                    version: release.tagName,
                    source: `github:${normalizedRepo}`,
                },
            });
        } catch (dbErr) {
            console.error("Impossible de synchroniser le plugin dans la base :", dbErr);
        }

        // ✅ Chargement du plugin
        loadPlugin(app, safePluginName);  // Utilisez safePluginName

        // See zipSafety.ts's requestClientRebuild: apps/web needs an actual
        // rebuild to see this plugin's client-side files (dashboard.js,
        // blocks.js) at all, whatever discoverClient.js/discoverServer.js's
        // import() shape looks like.
        if (isRunningInDocker()) requestClientRebuild(path.resolve(process.cwd(), "Themes"));

        console.log(`✅ Plugin ${safePluginName} installé avec succès.`);
    } catch (err) {
        console.error("❌ Erreur lors de l'installation du plugin :", err);

        // ✅ Dans catch : Recalculez avec safePluginName pour éviter uncontrolled paths (lignes ~112-113)
        const safePluginDirCatch = path.join(pluginsDir, safePluginName);
        const safeClientDirCatch = path.join(clientDir, safePluginName);

        if (fs.existsSync(safePluginDirCatch)) {
            fs.rmSync(safePluginDirCatch, { recursive: true, force: true });
        }
        if (fs.existsSync(safeClientDirCatch)) {
            fs.rmSync(safeClientDirCatch, { recursive: true, force: true });
        }

        // Nettoyage temp si extraction a eu lieu
        const extractPathCatch = path.join(tempDir, safePluginName);
        if (fs.existsSync(extractPathCatch)) {
            fs.rmSync(extractPathCatch, { recursive: true, force: true });
        }

        throw err;
    }
};

export default InstallPlugins;
