import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "@omega/db";
import { fetchLatestRelease } from "./github.js";
import { getCurrentCommit, isRunningInDocker } from "./gitState.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/Functions/Updater -> apps/api/Functions -> apps/api -> apps -> repo root
export const REPO_ROOT = path.resolve(__dirname, "../../../../");

export interface UpdateStatus {
  currentCommit: string | null;
  latestCommit: string | null;
  latestTag: string | null;
  releaseUrl: string | null;
  updateAvailable: boolean;
  runningInDocker: boolean;
  checkedAt: string;
}

export async function checkForUpdate(): Promise<UpdateStatus> {
  const runningInDocker = isRunningInDocker();
  const currentCommit = runningInDocker ? null : await getCurrentCommit(REPO_ROOT);
  const release = await fetchLatestRelease();

  const updateAvailable = Boolean(release && currentCommit && release.commitSha !== currentCommit);

  await prisma.appSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      lastCheckedAt: new Date(),
      lastVersionSeen: release?.tagName ?? null,
    },
    update: {
      lastCheckedAt: new Date(),
      lastVersionSeen: release?.tagName ?? null,
    },
  });

  return {
    currentCommit,
    latestCommit: release?.commitSha ?? null,
    latestTag: release?.tagName ?? null,
    releaseUrl: release?.htmlUrl ?? null,
    updateAvailable,
    runningInDocker,
    checkedAt: new Date().toISOString(),
  };
}
