'use client';
import { useEffect, useMemo, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '../../lib/blocks/core/coreBlocks.css';
import { createEditorSchema } from '../../lib/blocks/schema';
import { discoverClientBlockSpecs } from '../../lib/blocks/discoverClient';

// Renders a document that uses at least one plugin/theme custom block —
// see render.js for why those can't go through the server HTML export.
// Read-only: this is the public site, not the editor.
export default function BlockContentClient({ blocks }) {
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    let cancelled = false;
    discoverClientBlockSpecs().then((specs) => {
      if (!cancelled) setSchema(createEditorSchema(specs));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!schema) return null;

  return <Viewer schema={schema} blocks={blocks} />;
}

function Viewer({ schema, blocks }) {
  const initialContent = useMemo(() => (blocks.length > 0 ? blocks : undefined), [blocks]);
  const editor = useCreateBlockNote({ schema, initialContent });
  // All of BlockNote's interactive editing UI (formatting/link/slash
  // toolbars, the side-menu drag handle, file panel, table handles,
  // emoji picker) is meaningless on a read-only public page — left
  // enabled, the side menu in particular still reserves a gutter of
  // space and shows a grey drag-handle affordance on hover for every
  // block, visible to visitors who can't actually use it.
  return (
    <BlockNoteView
      editor={editor}
      editable={false}
      theme="light"
      formattingToolbar={false}
      linkToolbar={false}
      sideMenu={false}
      slashMenu={false}
      filePanel={false}
      tableHandles={false}
      emojiPicker={false}
    />
  );
}
