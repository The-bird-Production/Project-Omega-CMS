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
// KNOWN LIMITATION (confirmed by testing against a real production
// build): Next bakes this import's set of possible targets in at `next
// build` time, from whatever theme(s) exist under app/Themes/ then — a
// theme installed afterward, against the already-built, already-running
// production server, can never resolve here no matter how this template
// literal is shaped. A `webpackIgnore` + absolute file:// URL genuinely
// does dodge that, but then breaks immediately after on a second, harder
// wall: this file is .jsx, and Node has no built-in ability to parse JSX
// at all, so a real fix needs either a runtime JSX-transform loader or
// (simpler, and the same fix the client-side chrome components need
// regardless) rebuilding apps/web after a theme/plugin install.
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
