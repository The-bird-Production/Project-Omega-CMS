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
