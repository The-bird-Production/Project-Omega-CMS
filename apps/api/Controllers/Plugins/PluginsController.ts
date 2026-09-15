import type { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "@omega/db";
import InstallPlugins from "../../Functions/InstallPlugins.js";
import { fetchLatestRelease, repoFromSource } from "../../Functions/githubRelease.js";

function readInstalledPlugins(): { name: string; id: string; version: string; description: string; folder: string }[] {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    if (!fs.existsSync(pluginsDir)) return [];
    return fs
        .readdirSync(pluginsDir)
        .filter((plugin) => fs.existsSync(path.join(pluginsDir, plugin, "plugin.json")))
        .map((plugin) => {
            const manifest = JSON.parse(fs.readFileSync(path.join(pluginsDir, plugin, "plugin.json"), "utf-8"));
            return {
                name: manifest.name,
                id: manifest.id,
                version: manifest.version,
                description: manifest.description,
                folder: manifest.folder,
            };
        });
}

export const getPluginsInstalled = async (req: Request, res: Response) => {
    try {
        const installed = readInstalledPlugins();
        const rows = await prisma.plugin.findMany();
        const withRepo = installed.map((plugin) => {
            const row = rows.find((r: { pluginId: string }) => r.pluginId === plugin.id);
            return { ...plugin, repo: repoFromSource(row?.source) };
        });
        res.json(withRepo);
    } catch (err) {
        console.error("Erreur lors de la lecture des plugins installés :", err);
        res.status(500).json({ error: "Erreur lors de la lecture des plugins installés" });
    }
};

export const InstallPluginFromGithub = async (req: Request, res: Response, router: Router) => {
    const { repo } = req.body ?? {};
    if (!repo || typeof repo !== "string") {
        return res.status(400).json({ error: "Le champ 'repo' (owner/repo GitHub) est requis." });
    }
    try {
        await InstallPlugins(repo, router, false);
        res.status(200).json({ success: true, message: "Plugin installé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de l'installation du plugin : ${(err as Error).message}` });
    }
};

export const UpdatePlugin = async (req: Request, res: Response, router: Router) => {
    const pluginId = req.params.id;
    try {
        const row = await prisma.plugin.findUnique({ where: { pluginId } });
        const repo = repoFromSource(row?.source);
        if (!repo) {
            return res.status(400).json({
                error: "Ce plugin n'a pas de dépôt GitHub associé — impossible de le mettre à jour automatiquement.",
            });
        }
        await InstallPlugins(repo, router, true);
        res.status(200).json({ success: true, message: "mis à jour avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Erreur lors de la mise à jour du plugin : ${(err as Error).message}` });
    }
};

export const CheckPluginUpdate = async (req: Request, res: Response) => {
    const pluginId = req.params.id;
    try {
        const row = await prisma.plugin.findUnique({ where: { pluginId } });
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

export const getUserRoutes = (req: Request, res: Response) => {
    const pluginsDir = path.resolve(process.cwd(), "Plugins");
    if (!fs.existsSync(pluginsDir)) return res.json([]);
    const routes = fs
        .readdirSync(pluginsDir)
        .filter((plugin) => fs.existsSync(path.join(pluginsDir, plugin, "plugin.json")))
        .map((plugin) => {
            const manifest = JSON.parse(fs.readFileSync(path.join(pluginsDir, plugin, "plugin.json"), "utf-8"));
            return manifest.user?.routes || [];
        })
        .flat();
    res.json(routes);
};
