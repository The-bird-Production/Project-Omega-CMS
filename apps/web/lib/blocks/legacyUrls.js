// Images uploaded from the page editor used to be stored with the URL
// "undefined/image/<file>": the API built it from a BACKEND_URL env var that
// the official compose file never passed (fixed in uploadImage.js / the API
// controller). The files themselves were saved fine and are served from
// <backend>/image/<file>, so rewrite those broken URLs on read rather than
// asking admins to re-upload and re-insert every image by hand. The editor
// loads bodies through this too, so the next save writes the corrected URL
// back to the database.
export function fixLegacyUploadUrls(bodyJson) {
  if (typeof bodyJson !== 'string' || !bodyJson.includes('undefined/image/')) return bodyJson;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) return bodyJson;
  return bodyJson.replaceAll('"undefined/image/', `"${base}/image/`);
}
