import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "@omega/db";
import InstallTheme from "../../Functions/InstallTheme.js";
import { fetchLatestRelease, repoFromSource } from "../../Functions/githubRelease.js";

function readInstalledThemes(): { name: string; id: string; version: string; description: string; folder: string }[] {
    const themeDir = path.resolve(process.cwd(), "Themes");
    if (!fs.existsSync(themeDir)) return [];
    return fs
        .readdirSync(themeDir)
        .filter((theme) => fs.existsSync(path.join(themeDir, theme, "theme.json")))
        .map((theme) => {
            const manifest = JSON.parse(fs.readFileSync(path.join(themeDir, theme, "theme.json"), "utf-8"));
            return {
                name: manifest.name,
                id: manifest.id,
                version: manifest.version,
                description: manifest.description,
                folder: manifest.folder,
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

export const getCurrentTheme = async (req: Request, res: Response) => {
    const themeDir = path.resolve(process.cwd(), "Themes");
    // Récupérer le thème actuellement utilisé
    const currentTheme = fs.readdirSync(themeDir).filter((theme) => theme.toLowerCase() !== "readme.md").filter((theme) => theme.toLowerCase() !== "default").map((theme) => {
        const manifest = JSON.parse(fs.readFileSync(path.join(themeDir, theme, "theme.json"), "utf-8"));
        return manifest;
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
    res.json(manifest);
};
