import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "@omega/db";
import InstallTheme from "../../Functions/InstallTheme.js";
import DeleteTheme from "../../Functions/DeleteTheme.js";
import { fetchLatestRelease, repoFromSource } from "../../Functions/githubRelease.js";
import { fetchCatalog } from "../../Functions/catalog.js";

// `id` here is always the theme's FOLDER name (the Themes/<folder> this
// was read from), never theme.json's own "id" field — the two are
// different things and only coincide by luck. InstallTheme.ts names a
// theme's folder (and its Theme table row's themeId) after the sanitized
// GitHub repo it came from (see repoToLocalId in githubRelease.ts), e.g.
// "The-bird-Production-apdm-omega-theme" — theme.json's "id" is just
// whatever slug its author happened to write in the manifest (e.g.
// "apdm"), unrelated to that. Every consumer that resolves a real
// filesystem path or public URL from "theme.id" (resolveThemeChrome.js,
// lib/blocks/discover{Server,Client}.js, lib/pageTemplates/render.js,
// MainLayout.js's style.css link, and this file's own update/delete
// routes matching against the Theme table's themeId column) needs the
// folder name, not the manifest's own field — using the manifest's
// "id" here silently broke every one of those for any theme whose
// author's chosen id doesn't happen to match its install folder,
// confirmed by a real "thème introuvable" delete failure and a
// style.css 404 for exactly that reason.
function readInstalledThemes(): { name: string; id: string; version: string; description: string }[] {
    const themeDir = path.resolve(process.cwd(), "Themes");
    if (!fs.existsSync(themeDir)) return [];
    return fs
        .readdirSync(themeDir)
        .filter((theme) => fs.existsSync(path.join(themeDir, theme, "theme.json")))
        .map((theme) => {
            const manifest = JSON.parse(fs.readFileSync(path.join(themeDir, theme, "theme.json"), "utf-8"));
            return {
                name: manifest.name,
                id: theme,
                version: manifest.version,
                description: manifest.description,
            };
        });
}

export const getThemeInstalled = async (req: Request, res: Response) => {
    try {
        const installed = readInstalledThemes();
        const rows = await prisma.theme.findMany();
        const withRepo = installed.map((theme) => {
            const row = rows.find((r: { themeId: string }) => r.themeId === theme.id);
            return { ...theme, repo: repoFromSource(row?.source) };
        });
        res.json(withRepo);
    } catch (err) {
        console.error("Erreur lors de la lecture des thèmes installés :", err);
        res.status(500).json({ error: "Erreur lors de la lecture des thèmes installés" });
    }
};

export const InstallThemeFromGithub = async (req: Request, res: Response) => {
    const { repo } = req.body ?? {};
    if (!repo || typeof repo !== "string") {
        return res.status(400).json({ error: "Le champ 'repo' (owner/repo GitHub) est requis." });
    }
    try {
        await InstallTheme(repo, false);
        res.status(200).json({ success: true, message: "Theme installé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de l'installation du thème : ${(err as Error).message}` });
    }
};

export const UpdateTheme = async (req: Request, res: Response) => {
    const themeId = req.params.id;
    try {
        const row = await prisma.theme.findUnique({ where: { themeId } });
        const repo = repoFromSource(row?.source);
        if (!repo) {
            return res.status(400).json({
                error: "Ce thème n'a pas de dépôt GitHub associé — impossible de le mettre à jour automatiquement.",
            });
        }
        await InstallTheme(repo, true);
        res.status(200).json({ success: true, message: "mis à jour avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de la mise à jour du thème : ${(err as Error).message}` });
    }
};

export const DeleteThemeController = async (req: Request, res: Response) => {
    const themeId = req.params.id;
    try {
        await DeleteTheme(themeId);
        res.status(200).json({ success: true, message: "Thème supprimé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de la suppression du thème : ${(err as Error).message}` });
    }
};

export const CheckThemeUpdate = async (req: Request, res: Response) => {
    const themeId = req.params.id;
    try {
        const row = await prisma.theme.findUnique({ where: { themeId } });
        const repo = repoFromSource(row?.source);
        if (!repo) {
            return res.json({ updateAvailable: false, reason: "no-github-source" });
        }
        const release = await fetchLatestRelease(repo);
        if (!release) {
            return res.json({ updateAvailable: false, reason: "no-release" });
        }
        res.json({
            updateAvailable: release.tagName !== row?.version,
            latestVersion: release.tagName,
            currentVersion: row?.version,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de la vérification de mise à jour : ${(err as Error).message}` });
    }
};

export const getThemesCatalog = async (req: Request, res: Response) => {
    try {
        const catalog = await fetchCatalog("themes");
        res.json(catalog);
    } catch (err) {
        console.error("Erreur lors de la lecture du catalogue de thèmes :", err);
        res.status(500).json({ error: "Erreur lors de la lecture du catalogue de thèmes" });
    }
};

export const getCurrentTheme = async (req: Request, res: Response) => {
    const themeDir = path.resolve(process.cwd(), "Themes");
    // Récupérer le thème actuellement utilisé — ne garde que les entrées qui
    // sont réellement un dossier de thème (theme.json présent). Sans ce
    // filtre, un fichier comme le sentinel .rebuild-requested (voir
    // zipSafety.ts's requestClientRebuild) était traité comme un nom de
    // thème et son "theme.json" tenté en lecture plantait avec ENOTDIR.
    const currentTheme = fs
        .readdirSync(themeDir)
        .filter((theme) => theme.toLowerCase() !== "default")
        .filter((theme) => fs.existsSync(path.join(themeDir, theme, "theme.json")))
        .map((theme) => {
            const manifest = JSON.parse(fs.readFileSync(path.join(themeDir, theme, "theme.json"), "utf-8"));
            // See readInstalledThemes()'s comment: "id" must be the folder
            // name, not whatever theme.json's own "id" field says — every
            // caller of /themes/current resolves real paths/URLs from it.
            return { ...manifest, id: theme };
        });
    if (currentTheme.length === 0) {
        return res.status(404).json({ error: "Aucun thème actuellement utilisé switch to default" });
    }
    res.json(currentTheme[0]);
};
export const getDefaultTheme = async (req: Request, res: Response) => {
    const themeDir = path.resolve(process.cwd(), "Themes", "default");
    if (!fs.existsSync(themeDir)) {
        return res.status(404).json({ error: "Thème par défaut non trouvé" });
    }
    const manifestPath = path.join(themeDir, "theme.json");
    if (!fs.existsSync(manifestPath)) {
        return res.status(404).json({ error: "Manifest du thème par défaut non trouvé" });
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    // "default" is the one theme whose folder name is hardcoded rather
    // than derived from a GitHub repo, so this override is a no-op in
    // practice today — kept for the same reason as getCurrentTheme's,
    // in case that ever stops being true.
    res.json({ ...manifest, id: "default" });
};
