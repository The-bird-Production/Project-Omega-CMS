import { createReactBlockSpec } from '@blocknote/react';

// A single column — content lives in its children (any block type), same
// nesting mechanism BlockNote's own bulletListItem/toggleListItem use.
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
