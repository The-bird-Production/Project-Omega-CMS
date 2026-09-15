'use client';
import { useEffect, useMemo, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
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
  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}
