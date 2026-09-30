import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

// Walks the active theme's own public asset folder (logo, hero banners,
// etc. shipped with the theme itself — see docker-compose.yml's
// Themes_style bind mount into apps/web/public/themes) so an admin can
// reuse them in the Cover/Gallery blocks instead of re-uploading a copy of
// an image the theme already ships. Same "active theme id" lookup
// resolveThemeChrome.js uses for Header/Footer.
function collectImages(dir, baseUrl, depth = 0) {
  if (depth > 3 || !fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath, `${baseUrl}/${entry.name}`, depth + 1));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push({ name: entry.name, url: `${baseUrl}/${entry.name}` });
    }
  }
  return results;
}

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return Response.json({ images: [] });

    const res = await fetch(`${backendUrl}/themes/current`, { cache: 'no-store' });
    if (!res.ok) return Response.json({ images: [] });
    const theme = await res.json();
    if (!theme?.id) return Response.json({ images: [] });

    const themeDir = path.resolve(process.cwd(), 'public', 'themes', theme.id);
    const images = collectImages(themeDir, `/themes/${theme.id}`);
    return Response.json({ images });
  } catch (err) {
    console.error('Erreur lors de la lecture des images du thème :', err);
    return Response.json({ images: [] });
  }
}
