import fs from "fs";
import { transform } from "esbuild";

// Theme/plugin component files are authored as JSX inside a plain .js file
// (theme.json's config.components.<Name> convention, e.g. "Header.js"),
// which only ever worked because webpack bundled them at `next build`
// time — Node has no built-in ability to parse JSX at all, and these
// files need to be import()-able directly off disk at runtime instead
// (see apps/web/lib/theme/resolveThemeChrome.js and
// lib/pageTemplates/render.js): Next bakes every theme/plugin file that
// existed at build time into a fixed webpack map, so anything installed
// afterward is otherwise invisible to the already-running production
// server, no matter how the import is written. Compiling in place at
// install time, once, is what makes a newly-installed theme/plugin work
// immediately — no app rebuild, ever, for this class of file.
//
// A plain per-file syntax transform, not a bundle: every import (react,
// next/link, ...) is left exactly as it was written, to be resolved
// normally by Node's own module resolution when the compiled file is
// later imported — walking up from the theme's own location finds
// apps/web's installed react/next, the same instance the rest of the app
// uses, with no bundler or import-map trickery needed.
export async function compileComponentInPlace(filePath: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf-8");
  const { code } = await transform(source, {
    loader: "jsx",
    jsx: "automatic",
    format: "cjs",
    target: "node22",
    sourcefile: filePath,
  });
  // Node's module loader rejects any extension other than .js/.cjs/.mjs
  // outright (ERR_UNKNOWN_FILE_EXTENSION) regardless of the file's actual
  // content, so a theme author's authored-as-.jsx file still needs to
  // end up as .js to be import()-able at all once compiled.
  const outputPath = filePath.endsWith(".jsx") ? `${filePath.slice(0, -4)}.js` : filePath;
  fs.writeFileSync(outputPath, code);
  return outputPath;
}

// Best-effort per file — one theme/plugin file with unusual syntax
// shouldn't block the rest of a working install.
export async function compileComponentsInPlace(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await compileComponentInPlace(filePath);
    } catch (err) {
      console.error(`Impossible de compiler le composant "${filePath}" :`, err);
    }
  }
}
