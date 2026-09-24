import fs from 'fs';
import path from 'path';

// Server-side counterpart to discoverClient.js, used when rendering
// page/article body blocks for the public site (see render.js). Reads
// straight off disk to know which plugins/theme to even try, instead of
// calling the admin-gated /plugins endpoint — this runs on every public
// page request and has no admin session to call it with anyway. The
// import() calls below use the same template-literal-with-static-prefix
// shape as discoverClient.js/themeProvider.jsx on purpose: Next.js's
// bundler only resolves dynamic imports it can analyze this way, a fully
// runtime-computed path (e.g. via a file:// URL) isn't bundleable here.
//
// KNOWN LIMITATION, by design: same as pageTemplates/render.js — a
// plugin/theme's block contribution needs apps/web to rebuild before it's
// visible here (see apps/web/scripts/supervisor.mjs), because a
// BlockSpec's `render` function is a React component that would need the
// same cross-React-instance isolation Header/Footer now use, and a
// block's render function is meant to be embedded inline in arbitrary
// page content — the same reason page templates couldn't take that
// approach either. See resolveThemeChrome.js/loadCompiledComponent.js
// for where that isolation actually is used, and why.

const PLUGIN_COMPONENTS_DIR = path.resolve(process.cwd(), 'app', 'components', 'plugin');
const THEMES_DIR = path.resolve(process.cwd(), 'app', 'Themes');

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function discoverServerBlockSpecs() {
  const specs = {};

  if (fs.existsSync(PLUGIN_COMPONENTS_DIR)) {
    const pluginIds = fs
      .readdirSync(PLUGIN_COMPONENTS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(PLUGIN_COMPONENTS_DIR, d.name, 'blocks.js')))
      .map((d) => d.name);

    for (const pluginId of pluginIds) {
      try {
        const mod = await import(`../../app/components/plugin/${pluginId}/blocks.js`);
        Object.assign(specs, mod.default ?? mod);
      } catch (err) {
        console.error(`Erreur lors du chargement des blocs du plugin "${pluginId}" :`, err);
      }
    }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  let theme = backendUrl ? await fetchJson(`${backendUrl}/themes/current`) : null;
  if (!theme && backendUrl) theme = await fetchJson(`${backendUrl}/themes/default`);
  if (theme?.id && fs.existsSync(path.join(THEMES_DIR, theme.id, 'components', 'blocks.js'))) {
    try {
      const mod = await import(`../../app/Themes/${theme.id}/components/blocks.js`);
      Object.assign(specs, mod.default ?? mod);
    } catch (err) {
      console.error(`Erreur lors du chargement des blocs du thème "${theme.id}" :`, err);
    }
  }

  return specs;
}
