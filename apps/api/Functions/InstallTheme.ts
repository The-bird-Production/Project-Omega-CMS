import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";
import { prisma } from "@omega/db";
import { assertInside, assertSafeZipEntries, movePath, requestClientRebuild } from "./zipSafety.js";
import { compileComponentsInPlace } from "./compileComponent.js";
import { parseRepoInput, fetchLatestRelease, downloadReleaseArchive, unwrapSingleTopLevelDir, repoToLocalId } from "./githubRelease.js";
import { isRunningInDocker } from "./Updater/gitState.js";

function moveInto(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  movePath(srcDir, destDir);
}

// Header.js/Footer.js are the only theme files apps/web needs to
// import() directly off disk at runtime, rendered in isolation from the
// app's own React tree (see resolveThemeChrome.js/
// loadCompiledComponent.js for why). Button.js, blocks.js, and page
// templates stay JSX, uncompiled: they're only ever consumed via a
// normal webpack-bundled dynamic import that still needs an app rebuild
// to see a newly-installed theme (apps/web/scripts/supervisor.mjs
// handles that automatically) — compiling them would do nothing useful.
function collectComponentFilesToCompile(componentsDir: string): string[] {
  const files: string[] = [];
  for (const name of ["Header.js", "Footer.js"]) {
    const filePath = path.join(componentsDir, name);
    if (fs.existsSync(filePath)) files.push(filePath);
  }
  return files;
}

// A theme can ship starter content for its own pages — content/pages/
// <slug>.json, each { title, body } where body is the same block array
// shape the editor itself produces (see apps/web/lib/blocks/) — so
// installing it produces a site that actually looks like what the theme
// author built it for, with every element still editable as ordinary
// blocks, rather than a blank site the owner has to fill in from
// scratch. Auto-discovered by filesystem existence, no manifest entry
// needed, same as a theme's blocks.js. Never overwrites: a page already
// existing at that slug (from a previous install, or the owner's own
// edit) is left alone — this only ever fills in what's missing.
async function seedThemePages(themeDir: string): Promise<void> {
  const pagesDir = path.join(themeDir, "content", "pages");
  if (!fs.existsSync(pagesDir)) return;

  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.slice(0, -".json".length);
    try {
      const existing = await prisma.page.findUnique({ where: { slug } });
      if (existing) continue;

      const { title, body } = JSON.parse(fs.readFileSync(path.join(pagesDir, file), "utf-8"));
      if (!title || !Array.isArray(body)) continue;

      await prisma.page.create({ data: { slug, title, body: JSON.stringify(body) } });
    } catch (err) {
      console.error(`Impossible d'importer la page "${slug}" du thème :`, err);
    }
  }
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
// is downloaded and installed as a theme.
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
  // Only used for the TEMP staging directory below, and as a fallback if
  // the release doesn't have a usable theme.json — never for the final
  // install location (see finalThemeId below for why).
  const repoBasedId = sanitize(repoToLocalId(normalizedRepo));
  if (!repoBasedId) {
    throw new Error("Theme ID invalide ou non autorisé.");
  }

  const themesDir = path.resolve(process.cwd(), "Themes");
  const tempDir = path.resolve(process.cwd(), "temp");
  const extractDir = assertInside(tempDir, path.join(tempDir, repoBasedId), "temporaire");

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

  // Set once the real theme id is known (see below) — the catch block
  // only cleans up paths built from it if we actually got that far.
  let finalThemeId: string | null = null;

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

    // The theme's own id — from theme.json, not from the GitHub repo it
    // happened to be installed from — is what its own Header.js/Footer.js/
    // style.css/seeded page content actually reference (e.g.
    // "/themes/apdm/img/logo.png"), since that's the one identifier a
    // theme author controls and can hardcode safely. Naming the install
    // folder after the repo instead (e.g. "owner-repo-name") broke every
    // one of those hardcoded references — confirmed live: style.css itself
    // resolved fine (the CMS's own code already used the real folder name
    // for that), but every image the theme's own files/content referenced
    // by its declared id 404'd. Falls back to the repo-based id only if
    // theme.json is missing or declares no usable one.
    let resolvedThemeId = repoBasedId;
    try {
      const manifestPath = path.join(extractDir, "theme.json");
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        const sanitizedManifestId = manifest?.id ? sanitize(String(manifest.id)) : "";
        if (sanitizedManifestId) resolvedThemeId = sanitizedManifestId;
      }
    } catch (manifestErr) {
      console.error("theme.json illisible, utilisation de l'identifiant dérivé du dépôt :", manifestErr);
    }
    finalThemeId = resolvedThemeId;

    const themeDir = assertInside(themesDir, path.join(themesDir, finalThemeId), "de thème");
    if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
    movePath(extractDir, themeDir);
    deactivateOtherThemes(themesDir, finalThemeId, clientDir, styleDir);

    let finalComponentsDir: string;
    if (needsClientCopy) {
      const safeClientThemeDir = assertInside(clientDir as string, path.join(clientDir as string, finalThemeId), "client de thème");
      if (!update && !fs.existsSync(safeClientThemeDir)) {
        fs.mkdirSync(safeClientThemeDir, { recursive: true });
      }
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, finalThemeId), "de style");

      finalComponentsDir = path.join(safeClientThemeDir, "components");
      moveInto(path.join(themeDir, "components"), finalComponentsDir);
      moveInto(path.join(themeDir, "asset"), path.join(safeClientThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    } else {
      const safeStyleThemeDir = assertInside(styleDir, path.join(styleDir, finalThemeId), "de style");

      finalComponentsDir = path.join(themeDir, "components");
      moveInto(path.join(themeDir, "asset"), path.join(safeStyleThemeDir, "asset"));
      moveInto(path.join(themeDir, "style"), safeStyleThemeDir);
    }

    // Compiles Header.js/Footer.js from JSX to plain JS in place — see
    // compileComponent.ts for why this, not a rebuild, is what makes
    // them render immediately.
    await compileComponentsInPlace(collectComponentFilesToCompile(finalComponentsDir));

    if (inDocker) requestClientRebuild(themesDir);

    await seedThemePages(themeDir);

    // Suivi en base pour que l'admin/l'updater sachent ce qui est installé sans
    // relire tous les theme.json — best-effort, ne doit pas faire échouer l'install.
    try {
      const manifestPath = path.join(themeDir, "theme.json");
      const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : {};
      await prisma.theme.upsert({
        where: { themeId: finalThemeId },
        create: {
          themeId: finalThemeId,
          name: manifest.name ?? finalThemeId,
          version: release.tagName,
          source: `github:${normalizedRepo}`,
        },
        update: {
          name: manifest.name ?? finalThemeId,
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

    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    if (finalThemeId) {
      const themeDir = path.join(themesDir, finalThemeId);
      if (fs.existsSync(themeDir)) fs.rmSync(themeDir, { recursive: true, force: true });
      if (needsClientCopy && clientDir) {
        const clientThemeDir = path.join(clientDir, finalThemeId);
        if (fs.existsSync(clientThemeDir)) fs.rmSync(clientThemeDir, { recursive: true, force: true });
      }
      const styleThemeDir = path.join(styleDir, finalThemeId);
      if (fs.existsSync(styleThemeDir)) fs.rmSync(styleThemeDir, { recursive: true, force: true });
    }

    throw err;
  }
};

export default InstallTheme;
