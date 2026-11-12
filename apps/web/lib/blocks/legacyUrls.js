// Uploaded images are stored in page/article bodies as absolute URLs
// ("<backend>/image/<file>"), so any URL built with the wrong backend
// address breaks them for good. Two cases, both fixed on read rather than
// asking admins to re-upload and re-insert every image by hand — the
// editor loads bodies through this too, so the next save writes the
// corrected URL back to the database:
//
// - "undefined/image/<file>": the API built it from a BACKEND_URL env var
//   the official compose file never passed (fixed in uploadImage.js / the
//   API controller). The files themselves were saved fine.
// - "<another host>/image/<file>": content brought over from another
//   instance — articles imported (Articles → Importer) while running on a
//   pre-production server stored that server's address, and its images
//   stopped loading once it was gone, though the files had been copied
//   into this site's library. Only the CMS's own upload names (32 hex
//   characters, see the API's image controllers) are rewritten, so a
//   genuinely external image is left alone.

const FOREIGN_UPLOAD_RE = /"(https?:\/\/[^"/\s]+)\/image\/([0-9a-f]{32}\.(?:jpe?g|png|gif|webp|svg))"/gi;

function backendBase() {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
}

export function fixLegacyUploadUrls(bodyJson) {
  if (typeof bodyJson !== 'string') return bodyJson;
  const base = backendBase();
  if (!base || !bodyJson.includes('/image/')) return bodyJson;
  return bodyJson
    .replaceAll('"undefined/image/', `"${base}/image/`)
    .replace(FOREIGN_UPLOAD_RE, (match, origin, file) => (origin === base ? match : `"${base}/image/${file}"`));
}

// The same fix for a single URL (e.g. an article's cover `image` field).
export function fixLegacyUploadUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  return JSON.parse(fixLegacyUploadUrls(JSON.stringify(url)));
}
