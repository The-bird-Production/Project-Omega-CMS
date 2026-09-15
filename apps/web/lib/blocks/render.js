import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { defaultBlockSpecs } from '@blocknote/core';
import { createEditorSchema } from './schema.js';
import { discoverServerBlockSpecs } from './discoverServer.js';

const DEFAULT_BLOCK_TYPES = new Set(Object.keys(defaultBlockSpecs));

// Custom blocks (from a plugin/theme) render fine in the editor and in a
// live, mounted BlockNoteView, but BlockNote's headless server-side HTML
// export doesn't reliably render React-based custom block specs outside a
// real mounted React tree — it silently produces an empty element instead
// of throwing, so this has to be checked for up front rather than
// discovered as a rendering bug. Pages/articles that only use the default
// block types (by far the common case) still get full server rendering.
export function containsCustomBlocks(blocks) {
  for (const block of blocks) {
    if (!DEFAULT_BLOCK_TYPES.has(block.type)) return true;
    if (Array.isArray(block.children) && block.children.length > 0 && containsCustomBlocks(block.children)) {
      return true;
    }
  }
  return false;
}

// Rebuilding the schema means re-scanning disk and re-importing every
// plugin/theme block module — cheap, but pointless to redo on every
// single page view, so it's cached for a bit and rebuilt lazily. A newly
// installed plugin's blocks show up on public pages within this window.
const SCHEMA_CACHE_MS = 60 * 1000;
let cachedSchema = null;
let cachedAt = 0;

async function getSchema() {
  if (cachedSchema && Date.now() - cachedAt < SCHEMA_CACHE_MS) return cachedSchema;
  const specs = await discoverServerBlockSpecs();
  cachedSchema = createEditorSchema(specs);
  cachedAt = Date.now();
  return cachedSchema;
}

// Prepares a page/article's stored body (a JSON-stringified BlockNote
// document) for rendering: pages/articles built entirely from the default
// block types (the common case) get full server-rendered HTML — good for
// SEO/first paint. One using at least one plugin/theme custom block is
// rendered client-side instead (mode: 'client'), needed by the (confirmed,
// see containsCustomBlocks) limits of BlockNote's headless HTML export;
// see BlockContent.jsx for how each mode is actually rendered.
export async function prepareBlockContent(bodyJson) {
  if (!bodyJson) return { mode: 'empty' };

  let blocks;
  try {
    blocks = JSON.parse(bodyJson);
  } catch {
    return { mode: 'empty' };
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return { mode: 'empty' };

  if (containsCustomBlocks(blocks)) {
    return { mode: 'client', blocks };
  }

  const schema = await getSchema();
  const editor = ServerBlockNoteEditor.create({ schema });
  const html = await editor.blocksToFullHTML(blocks);
  return { mode: 'html', html };
}
