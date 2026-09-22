import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";
import { prisma } from "@omega/db";
import { assertInside, assertSafeZipEntries, movePath } from "./zipSafety.js";
import { parseRepoInput, fetchLatestRelease, downloadReleaseArchive, unwrapSingleTopLevelDir, repoToLocalId } from "./githubRelease.js";
import { isRunningInDocker } from "./Updater/gitState.js";

function moveInto(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  movePath(srcDir, destDir);
}

// Only one non-default theme is ever "active" — getCurrentTheme() (see
// ThemeController.ts) just returns the first non-"default" folder under
// Themes/, so leaving a previous theme's files in place after installing
// a different one made which theme actually renders depend on filesystem
// listing order rather than on what was just installed. Removes every
// theme folder/DB row/client-and-style copy except "default" and the one
// about to be installed, so exactly one non-default theme exists at a
// time — best-effort per theme, so one leftover file permission issue
// doesn't block the new install.
function deactivateOtherThemes(
  themesDir: string,
  keepThemeId: string,
  clientDir: string | null,
  styleDir: string
): void {
  if (!fs.existsSync(themesDir)) return;
  const otherThemeIds = fs
    .readdirSync(themesDir)
    .filter((entry) => entry !== "default" && entry !== keepThemeId)
    .filter((entry) => fs.statSync(path.join(themesDir, entry)).isDirectory());

  for (const themeId of otherThemeIds) {
    try {
      fs.rmSync(path.join(themesDir, themeId), { recursive: true, force: true });
      if (clientDir) {
        const clientThemeDir = path.join(clientDir, themeId);
        if (fs.existsSync(clientThemeDir)) fs.rmSync(clientThemeDir, { recursive: true, force: true });
      }
      const styleThemeDir = path.join(styleDir, themeId);
      if (fs.existsSync(styleThemeDir)) fs.rmSync(styleThemeDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Impossible de désactiver l'ancien thème "${themeId}" :`, err);
    }
  }

  if (otherThemeIds.length > 0) {
    prisma.theme
      .deleteMany({ where: { themeId: { in: otherThemeIds } } })
      .catch((err: unknown) => console.error("Impossible de retirer les anciens thèmes de la base :", err));
  }
}

// repo: a GitHub "owner/repo" (or full github.com URL) whose latest release
// is downloaded and installed as a theme. The local theme id is always
// derived from the repo, deterministically, so re-installing (update=true)
// the same repo lands on the same theme directory/DB row.
const InstallTheme = async (repo: string, update: boolean): Promise<void> => {
  const isDev = process.env.NODE_ENV !== "production";
  // Docker's docker-compose.yml bind-mounts this same Themes (and
  // Themes_style) directory into both containers, at each one's own
  // expected path — apps/web sees a theme's components/ automatically,
  // no copy needed. A bare-metal checkout (dev OR production) is a single
  // process tree with no such shared mount, so components/ has to be
  // copied into apps/web's own tree there, exactly like dev mode already
  // does — the previous version of this function only ever did that copy
  // for isDev, silently leaving a theme's Header/Footer/blocks/page
  // templates unreachable from apps/web on a bare-metal production
  // instance.
  const inDocker = isRunningInDocker();
  const needsClientCopy = !inDocker;

  const normalizedRepo = parseRepoInput(repo);
  const sanitizedThemeId = sanitize(repoToLocalId(normalizedRepo));
  if (!sanitizedThemeId) {
    throw new Error("Theme ID invalide ou non autorisé.");
  }

  const themesDir = path.resolve(process.cwd(), "Themes");
  const themeDir = assertInside(themesDir, path.join(themesDir, sanitizedThemeId), "de thème");
  const tempDir = path.resolve(process.cwd(), "temp");
  const extractDir = assertInside(tempDir, path.join(tempDir, sanitizedThemeId), "temporaire");

  let clientDir: string | null = null;
  let styleDir: string;
  if (needsClientCopy) {
    // Same reasoning as clientDir above: a bare-metal checkout (dev OR
    // production) has apps/web right next to apps/api on the same
    // filesystem, so the monorepo-relative path is correct either way —
    // this used to only take that path for isDev, leaving a bare-metal
    // production install's style/style.css copied to apps/api's own
    // Themes_style instead of somewhere apps/web actually serves from.
    const cms = await import("../../../cms.js");
    clientDir = path.resolve(cms.dirname, "apps", "web", "app", "Themes");
    styleDir = path.resolve(cms.dirname, "apps", "web", "public", "themes");
  } else {
    styleDir = path.resolve(process.cwd(), "Themes_style");
  }

  try {
    console.log(`Installing theme from ${normalizedRepo} in ${isDev ? "development" : "production"} mode...`);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const release = await fetchLatestRelease(normalizedRepo);
    if (!release) {
      throw new Error(`Aucune release trouvée pour ${normalizedRepo}. Le dépôt doit avoir au moins une release GitHub.`);
    }

    const { zip, needsUnwrap } = await downloadReleaseArchive(release, "theme.zip");
    assertSafeZipEntries(zip, extractDir);
    zip.extractAllTo(extractDir, true);
    if (needsUnwrap) unwrapSingleTopLevelDir(extractDir);

    if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
    movePath(extractDir, themeDir);
    deactivateOtherThemes(themesDir, sanitizedThemeId, clientDir, styleDir);

    if (needsClientCopy) {
      const safeClientThemeDir = assertInside(clientDir as string, path.join(clientDir as string, sanitizedThemeId), "client de thème");
      if (!update && !fs.existsSync(safeClientThemeDir)) {
        fs.mkdirSync(safeClientThemeDir, { recursive: true });
      }
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, sanitizedThemeId), "de style");

      moveInto(path.join(themeDir, "components"), path.join(safeClientThemeDir, "components"));
      moveInto(path.join(themeDir, "asset"), path.join(safeClientThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    } else {
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, sanitizedThemeId), "de style");

      moveInto(path.join(themeDir, "asset"), path.join(safeStyleThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    }

    // Suivi en base pour que l'admin/l'updater sachent ce qui est installé sans
    // relire tous les theme.json — best-effort, ne doit pas faire échouer l'install.
    try {
      const manifestPath = path.join(themeDir, "theme.json");
      const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : {};
      await prisma.theme.upsert({
        where: { themeId: sanitizedThemeId },
        create: {
          themeId: sanitizedThemeId,
          name: manifest.name ?? sanitizedThemeId,
          version: release.tagName,
          source: `github:${normalizedRepo}`,
        },
        update: {
          name: manifest.name ?? sanitizedThemeId,
          version: release.tagName,
          source: `github:${normalizedRepo}`,
        },
      });
    } catch (dbErr) {
      console.error("Impossible de synchroniser le thème dans la base :", dbErr);
    }

    console.log("✅ Thème installé avec succès.");
  } catch (err) {
    console.error("Erreur lors de l'installation du theme :", err);

    if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    if (needsClientCopy && clientDir) {
      const clientThemeDir = path.join(clientDir, sanitizedThemeId);
      if (fs.existsSync(clientThemeDir)) fs.rmSync(clientThemeDir, { recursive: true, force: true });
    }
    const styleThemeDir = path.join(styleDir, sanitizedThemeId);
    if (fs.existsSync(styleThemeDir)) fs.rmSync(styleThemeDir, { recursive: true, force: true });

    throw err;
  }
};

export default InstallTheme;
