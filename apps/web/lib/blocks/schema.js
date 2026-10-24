import { BlockNoteSchema, defaultBlockSpecs, defaultStyleSpecs } from '@blocknote/core';
import { coreBlockSpecs } from './core/index.js';
import { fontSizeStyle, fontFamilyStyle } from './core/textStyles.js';

// Merges the core block types with whatever plugins/the active theme
// contribute (see discoverClient.js) into one schema.
// The admin editor and the public site's browser renderer build their
// schema this way, so a block a plugin registers behaves identically in
// both places (server-rendered pages use render.js's own schema).
// Same reasoning for fontSize/fontFamily (see textStyles.jsx) — registered
// here so the read-only public view renders them identically too.
export function createEditorSchema(contributedSpecs = {}) {
  return BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      ...coreBlockSpecs,
      ...contributedSpecs,
    },
    styleSpecs: {
      ...defaultStyleSpecs,
      fontSize: fontSizeStyle,
      fontFamily: fontFamilyStyle,
    },
  });
}
