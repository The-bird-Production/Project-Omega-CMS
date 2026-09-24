async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Resolves a page's custom template (page.template) to the active theme's
// component for it — null if there's no template set, the active theme
// changed, or the template no longer exists in it (the caller falls back
// to normal block rendering in that case, see app/[slug]/page.jsx). The
// import() below uses the same template-literal-with-static-prefix shape
// as apps/web/lib/blocks/discoverServer.js, for the same reason: it's the
// only dynamic-import shape Next's bundler can actually resolve here.
//
// KNOWN LIMITATION, by design (not an oversight): a theme installed at
// runtime needs apps/web to actually rebuild before this can resolve —
// see apps/web/scripts/supervisor.mjs, which does that automatically,
// triggered by a sentinel file apps/api writes after a successful
// install. Unlike Header/Footer (see resolveThemeChrome.js), a page
// template embeds other host React components (BlockContent) inline —
// rendering it via a genuine runtime import + isolated renderToString,
// the way Header/Footer now work with zero rebuild needed, would mean
// BlockContent renders using a *different* React instance than the one
// Next vendors internally for its real Server Component tree, which
// breaks outright (confirmed by testing this exact failure on Header/
// Footer before isolating them — see loadCompiledComponent.js). Solving
// that for arbitrary theme-embedded host components was out of scope
// here; the rebuild-on-install path already handles this correctly.
export async function getPageTemplateComponent(templateName) {
  if (!templateName) return null;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;

  let theme = await fetchJson(`${backendUrl}/themes/current`);
  if (!theme) theme = await fetchJson(`${backendUrl}/themes/default`);
  if (!theme?.id) return null;

  try {
    const mod = await import(`../../app/Themes/${theme.id}/components/pages/${templateName}.jsx`);
    return mod.default ?? null;
  } catch {
    return null;
  }
}
