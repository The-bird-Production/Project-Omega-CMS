// Extracts plain text from a stored body (a JSON-stringified BlockNote
// document) — used for meta descriptions and list excerpts, replacing the
// old "strip HTML tags" approach now that body isn't HTML anymore.
export function blocksToPlainText(bodyJson) {
  if (!bodyJson) return '';

  let blocks;
  try {
    blocks = JSON.parse(bodyJson);
  } catch {
    return '';
  }
  if (!Array.isArray(blocks)) return '';

  const parts = [];
  const walkInline = (content) => {
    if (!Array.isArray(content)) return;
    for (const item of content) {
      if (typeof item?.text === 'string') parts.push(item.text);
    }
  };
  const walkBlocks = (list) => {
    for (const block of list) {
      walkInline(block.content);
      if (Array.isArray(block.children) && block.children.length > 0) {
        walkBlocks(block.children);
      }
    }
  };
  walkBlocks(blocks);

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// URL of the first image block in a stored body (depth-first), or '' —
// used as a thumbnail for article cards when the article has no cover
// `image` of its own (the common case: most articles just start with an
// image block, imported ones included).
export function firstImageUrl(bodyJson) {
  if (!bodyJson) return '';

  let blocks;
  try {
    blocks = JSON.parse(bodyJson);
  } catch {
    return '';
  }
  if (!Array.isArray(blocks)) return '';

  const find = (list) => {
    for (const block of list) {
      if (block?.type === 'image' && block.props?.url) return block.props.url;
      if (Array.isArray(block?.children) && block.children.length > 0) {
        const found = find(block.children);
        if (found) return found;
      }
    }
    return '';
  };
  return find(blocks);
}
