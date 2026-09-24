import { getMenu } from "../../../lib/menu";
import { resolveThemeChrome } from "../../../lib/theme/resolveThemeChrome";
import PageViewTracker from "./PageViewTracker";

// A public page's Header/Footer/menu/stylesheet, all resolved server-side
// — no client-side "theme provider" fetching this after the fact
// anymore, see resolveThemeChrome.js for why (a theme installed at
// runtime needs a genuine runtime import to work at all, which only
// makes sense to do once, on the server, rather than duplicating it in
// the browser for every visitor).
//
// pathname is a required prop, not read via next/headers's headers() —
// that's a "Dynamic API" that forces the whole route out of static/ISR
// rendering the moment it's called (confirmed by testing this: every
// public page started failing to build with DYNAMIC_SERVER_USAGE).
// Every caller already knows its own route (a slug, an article's path,
// home), so there's no need to pay that cost just to know it here too.
//
// An installed theme's Header/Footer come back as a pre-rendered HTML
// string (headerHtml/footerHtml), not a React element (headerElement/
// footerElement, only ever set for the statically-imported "default"
// theme) — see resolveThemeChrome.js/loadCompiledComponent.js for why:
// Next's real Server Component tree can't accept an element created by
// a different React instance than the one it vendors internally.
async function Layout({ children, pathname = "/" }) {
  const menu = await getMenu("main");
  const { headerElement: HeaderElement, footerElement: FooterElement, headerHtml, footerHtml, theme } =
    await resolveThemeChrome({ menu, pathname });

  return (
    <>
      {theme?.id && <link rel="stylesheet" href={`/themes/${theme.id}/style.css`} />}
      {HeaderElement && <HeaderElement menu={menu} pathname={pathname} />}
      {headerHtml && <div dangerouslySetInnerHTML={{ __html: headerHtml }} />}
      {children}
      {FooterElement && <FooterElement menu={menu} pathname={pathname} />}
      {footerHtml && <div dangerouslySetInnerHTML={{ __html: footerHtml }} />}
      <PageViewTracker />
    </>
  );
}

export default Layout;
