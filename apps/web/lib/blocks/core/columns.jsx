import { createReactBlockSpec } from '@blocknote/react';

// A single column — content lives in its children (any block type), same
// nesting mechanism BlockNote's own bulletListItem/toggleListItem use.
// Marked with Bootstrap's own .col so a Bootstrap-based theme's grid
// CSS applies automatically; the actual flex/grid *display* on the
// children container is still set via coreBlocks.css's :has() rule (see
// that file), this class alone isn't what makes columns lay out.
const columnSpec = createReactBlockSpec(
  { type: 'column', propSchema: {}, content: 'none' },
  { render: () => <div className="omega-column" /> }
);

// The container: insert this, then add Column blocks as its children
// (indent them under it) — see slashMenu.js, which inserts both together
// so authors don't have to know that by hand.
const columnsSpec = createReactBlockSpec(
  { type: 'columns', propSchema: {}, content: 'none' },
  { render: () => <div className="omega-columns" /> }
);

export const column = columnSpec();
export const columns = columnsSpec();
