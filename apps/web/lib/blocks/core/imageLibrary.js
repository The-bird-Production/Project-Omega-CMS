// The images an admin can reuse instead of uploading again: previous
// uploads (GET /image/get/all) plus the active theme's own bundled assets
// (GET /api/theme-images — a Next.js-side route, see that route for why).
// Shared by ImagePicker (Cover/Gallery) and the image block's file panel.
export async function fetchImageLibrary() {
  const [uploadsRes, themeRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/get/all`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch('/api/theme-images')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);
  const uploaded = (uploadsRes?.data?.files || []).map((f) => ({
    name: f.title || f.file,
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${f.file}`,
  }));
  const theme = (themeRes?.images || []).map((img) => ({ ...img, fromTheme: true }));
  return [...theme, ...uploaded];
}
