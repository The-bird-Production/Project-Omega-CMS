import path from "path";
import DefaultHeader from "../../app/Themes/default/components/Header.js";
import DefaultFooter from "../../app/Themes/default/components/Footer.js";
import { renderCompiledToHtml } from "../loadCompiledComponent";

async function fetchJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Resolves the active theme's Header/Footer for server-side rendering —
// this is what MainLayout.js renders around every public page's content.
//
// "default" is statically imported and rendered as a normal React
// element, exactly like any other core code, bundled at `next build`
// time — it always ships with the app, so there's nothing wrong with the
// old build-time-bundling approach for it specifically.
//
// Any other theme is installed at runtime, long after that build ran, so
// its component is loaded from disk via a genuine runtime import instead
// (compiled from JSX to plain JS at install time, see
// apps/api/Functions/compileComponent.ts) — and rendered to a plain HTML
// string in isolation, not as a React element in this app's own tree
// (see loadCompiledComponent.js's renderCompiledToHtml for why that
// isolation is required, not just a style choice).
export async function resolveThemeChrome(chromeProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return { theme: null, headerElement: null, footerElement: null, headerHtml: null, footerHtml: null };

  let theme = await fetchJson(`${backendUrl}/themes/current`);
  if (!theme) theme = await fetchJson(`${backendUrl}/themes/default`);
  if (!theme?.id) return { theme: null, headerElement: null, footerElement: null, headerHtml: null, footerHtml: null };

  if (theme.id === "default") {
    return { theme, headerElement: DefaultHeader, footerElement: DefaultFooter, headerHtml: null, footerHtml: null };
  }

  const themeDir = path.resolve(process.cwd(), "app", "Themes", theme.id, "components");
  const [headerHtml, footerHtml] = await Promise.all([
    renderCompiledToHtml(path.join(themeDir, "Header.js"), chromeProps),
    renderCompiledToHtml(path.join(themeDir, "Footer.js"), chromeProps),
  ]);
  return { theme, headerElement: null, footerElement: null, headerHtml, footerHtml };
}
