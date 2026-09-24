import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { coreBlockSpecs } from './core/index.js';

// Merges the core block types with whatever plugins/the active theme
// contribute (see discoverClient.js / discoverServer.js) into one schema.
// Both the admin editor and the public renderer build their schema this
// way, so a block a plugin registers behaves identically in both places.
export function createEditorSchema(contributedSpecs = {}) {
  return BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      ...coreBlockSpecs,
      ...contributedSpecs,
    },
  });
}
