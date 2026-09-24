import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";
import { prisma } from "@omega/db";
import { assertInside, requestClientRebuild } from "./zipSafety.js";
import { isRunningInDocker } from "./Updater/gitState.js";

// themeId: the sanitized folder name (see InstallTheme.ts's repoToLocalId),
// not a GitHub repo — matches what getThemeInstalled()/theme.json's own
// "id" field expose to the admin UI. Removes exactly what InstallTheme.ts
// put in place for this theme (its own folder, plus the bare-metal client
// copy and style copy where applicable) and its Theme table row — but
// never any `page` rows a theme may have seeded on install (see
// seedThemePages in InstallTheme.ts): those are the site owner's content
// now, independent of whether the theme that first created them is still
// installed.
const DeleteTheme = async (themeId: string): Promise<void> => {
  const sanitizedThemeId = sanitize(themeId);
  if (!sanitizedThemeId) {
    throw new Error("Theme ID invalide ou non autorisé.");
  }
  if (sanitizedThemeId.toLowerCase() === "default") {
    throw new Error("Le thème par défaut ne peut pas être supprimé.");
  }

  const inDocker = isRunningInDocker();
  const needsClientCopy = !inDocker;

  const themesDir = path.resolve(process.cwd(), "Themes");
  const themeDir = assertInside(themesDir, path.join(themesDir, sanitizedThemeId), "de thème");

  if (!fs.existsSync(themeDir)) {
    throw new Error(`Le thème "${sanitizedThemeId}" n'est pas installé.`);
  }

  let clientDir: string | null = null;
  let styleDir: string;
  if (needsClientCopy) {
    // Same monorepo-relative resolution as InstallTheme.ts — apps/web is
    // right next to apps/api on a bare-metal checkout (dev or prod).
    const cms = await import("../../../cms.js");
    clientDir = path.resolve(cms.dirname, "apps", "web", "app", "Themes");
    styleDir = path.resolve(cms.dirname, "apps", "web", "public", "themes");
  } else {
    styleDir = path.resolve(process.cwd(), "Themes_style");
  }

  fs.rmSync(themeDir, { recursive: true, force: true });

  if (clientDir) {
    const clientThemeDir = assertInside(clientDir, path.join(clientDir, sanitizedThemeId), "client de thème");
    if (fs.existsSync(clientThemeDir)) fs.rmSync(clientThemeDir, { recursive: true, force: true });
  }

  const styleThemeDir = assertInside(styleDir, path.join(styleDir, sanitizedThemeId), "de style");
  if (fs.existsSync(styleThemeDir)) fs.rmSync(styleThemeDir, { recursive: true, force: true });

  await prisma.theme.deleteMany({ where: { themeId: sanitizedThemeId } });

  // Docker only: apps/web needs to rebuild to stop referencing this
  // theme's now-gone page templates/blocks in its own webpack bundle —
  // same trigger InstallTheme.ts uses, see zipSafety.ts's
  // requestClientRebuild for why. Header/Footer/Button don't need this
  // (see resolveThemeChrome.js), but nothing bad happens by requesting it
  // unconditionally on delete too.
  if (inDocker) requestClientRebuild(themesDir);
};

export default DeleteTheme;
