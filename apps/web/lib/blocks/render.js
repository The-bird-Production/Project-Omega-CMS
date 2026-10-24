import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { BlockNoteSchema, defaultBlockSpecs, defaultStyleSpecs } from '@blocknote/core';
import { fixLegacyUploadUrls } from './legacyUrls';
import { serverCoreBlockSpecs, finalizeBlockHtml } from './serverBlocks.js';
import { fontSizeStyle, fontFamilyStyle } from './core/textStyles.js';

// Block types the server can render to HTML itself: BlockNote's own, plus
// the CMS's core blocks through their server versions (serverBlocks.js).
// Anything else comes from a plugin/theme (a React component the headless
// export can't render — it silently produces an empty element instead of
// throwing, so this has to be checked for up front), and the page is then
// rendered in the browser instead. Before the core blocks had server
// versions, every page using a banner, columns, buttons... ended up
// browser-rendered, invisible to search engines that don't run JavaScript.
const SERVER_BLOCK_TYPES = new Set([...Object.keys(defaultBlockSpecs), ...Object.keys(serverCoreBlockSpecs)]);

export function containsCustomBlocks(blocks) {
  for (const block of blocks) {
    if (!SERVER_BLOCK_TYPES.has(block.type)) return true;
    if (Array.isArray(block.children) && block.children.length > 0 && containsCustomBlocks(block.children)) {
      return true;
    }
  }
  return false;
}

const serverSchema = BlockNoteSchema.create({
  blockSpecs: { ...defaultBlockSpecs, ...serverCoreBlockSpecs },
  styleSpecs: { ...defaultStyleSpecs, fontSize: fontSizeStyle, fontFamily: fontFamilyStyle },
});

function walk(blocks, fn) {
  for (const block of blocks) {
    fn(block);
    if (Array.isArray(block.children)) walk(block.children, fn);
  }
}

async function fetchLatestArticles(count, locale) {
  try {
    const params = new URLSearchParams({ page: '1', pageSize: String(count), locale });
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/search?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

// Gives the server versions what they can't work out themselves (see
// serverBlocks.js's SERVER_ONLY_PROPS): ids for blocks that have none
// (pages imported from a theme's JSON files — the accordion/gallery need
// unique ids to target), which block comes first, the articles to list.
async function prepareForExport(blocks, locale) {
  let n = 0;
  walk(blocks, (block) => {
    if (!block.id) block.id = `omega-b${++n}`;
  });
  if (blocks[0]?.type === 'cover') blocks[0].props = { ...blocks[0].props, omegaFirst: true };

  const lists = [];
  walk(blocks, (block) => block.type === 'articleList' && lists.push(block));
  if (lists.length > 0) {
    const max = Math.min(50, Math.max(...lists.map((b) => Number(b.props?.count) || 6)));
    const articles = await fetchLatestArticles(max, locale);
    const prefix = locale && locale !== 'fr' ? `/${locale}` : '';
    for (const block of lists) {
      const count = Number(block.props?.count) || 6;
      block.props = { ...block.props, omegaArticles: JSON.stringify(articles.slice(0, count)), omegaLinkPrefix: prefix };
    }
  }
}

// Prepares a page/article's stored body (a JSON-stringified BlockNote
// document) for rendering: pages/articles built from BlockNote's own
// blocks and the CMS's core blocks (the normal case) get full
// server-rendered HTML — the content is in the page sent to browsers and
// search engines. One using at least one plugin/theme block is rendered
// in the browser instead (mode: 'client', see containsCustomBlocks); see
// BlockContent.jsx for how each mode is actually rendered.
export async function prepareBlockContent(bodyJson, { locale = 'fr' } = {}) {
  if (!bodyJson) return { mode: 'empty' };

  let blocks;
  try {
    blocks = JSON.parse(fixLegacyUploadUrls(bodyJson));
  } catch {
    return { mode: 'empty' };
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return { mode: 'empty' };

  if (containsCustomBlocks(blocks)) {
    return { mode: 'client', blocks };
  }

  await prepareForExport(blocks, locale);
  const editor = ServerBlockNoteEditor.create({ schema: serverSchema });
  const exported = await editor.blocksToFullHTML(blocks);
  const template = editor.jsdom.window.document.createElement('template');
  template.innerHTML = exported;
  finalizeBlockHtml(template.content);
  return { mode: 'html', html: template.innerHTML };
}
