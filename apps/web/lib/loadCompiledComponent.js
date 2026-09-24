import { pathToFileURL } from "url";

// Loads a theme/plugin file that apps/api's compileComponent.ts already
// transformed from JSX to plain CommonJS at install time (see that file
// for why: Node can't parse JSX at all, and this needs to be a genuine
// runtime import so a theme/plugin takes effect immediately, with no app
// rebuild). Returns null on any failure — caller decides the fallback (a
// missing theme, a removed template, a plugin with no dashboard, ...).
async function importCompiled(absolutePath) {
  try {
    return await import(/* webpackIgnore: true */ pathToFileURL(absolutePath).href);
  } catch {
    return null;
  }
}

// Node's CJS/ESM interop for a module that sets `exports.default` itself
// (which is what esbuild's CJS output does for `export default ...`)
// wraps the whole CommonJS `module.exports` object as `mod.default`,
// rather than synthesizing a separate named `default` export the way it
// does for a plain `exports.foo = ...`. Confirmed by testing this
// directly: `mod.default` comes back as `{ default: <the real thing> }`,
// not the real thing itself.
function unwrapDefault(mod) {
  if (!mod) return null;
  if (mod.default && typeof mod.default === "object" && "default" in mod.default) {
    return mod.default.default;
  }
  return mod.default ?? null;
}

// Renders a compiled component (a theme's Header/Footer, a page template)
// to a plain HTML string, in complete isolation from the app's own React
// tree — react and react-dom/server are themselves loaded via a genuine
// runtime import here (webpackIgnore), resolving to the exact same
// node_modules/react instance the compiled file's own require("react")
// resolves to (both walk up from somewhere under apps/web to the same
// node_modules/react).
//
// This isolation is not optional: Next.js vendors its own internal React
// build for its real Server Component tree (next/dist/compiled/react),
// separate from the plain node_modules/react this file and the compiled
// component both use. Handing Next's RSC serializer a React element
// created by that different instance breaks it outright — confirmed by
// testing this directly (TypeError: Cannot read properties of null
// (reading 'useContext'), regardless of whether the component itself uses
// any hooks). Rendering to a string sidesteps that entirely: by the time
// the result reaches the app's own render tree, it's just text, with no
// React-element identity for the RSC serializer to choke on — the same
// technique lib/blocks/render.js already uses for the same class of
// problem (third-party-authored React content that must render on the
// server, see BlockContent.jsx's dangerouslySetInnerHTML).
export async function renderCompiledToHtml(absolutePath, props) {
  try {
    const [reactMod, reactDomServerMod, componentMod] = await Promise.all([
      import(/* webpackIgnore: true */ "react"),
      import(/* webpackIgnore: true */ "react-dom/server"),
      importCompiled(absolutePath),
    ]);
    const Component = unwrapDefault(componentMod);
    if (typeof Component !== "function") return null;

    const createElement = reactMod.createElement ?? reactMod.default?.createElement;
    const renderToStaticMarkup = reactDomServerMod.renderToStaticMarkup ?? reactDomServerMod.default?.renderToStaticMarkup;
    return renderToStaticMarkup(createElement(Component, props));
  } catch (err) {
    console.error(`Erreur lors du rendu du composant compilé "${absolutePath}" :`, err);
    return null;
  }
}
