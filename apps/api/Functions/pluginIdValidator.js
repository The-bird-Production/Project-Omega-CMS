// Kept in its own module (no Prisma/DB import) so it can be unit tested in isolation
// and reused wherever a plugin/theme id needs to be validated before touching the filesystem.
export function isSafePluginId(pluginId) {
    return typeof pluginId === "string" && /^[a-zA-Z0-9_-]+$/.test(pluginId);
}

export default isSafePluginId;
