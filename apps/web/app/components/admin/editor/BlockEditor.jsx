'use client';
import { useEffect, useMemo, useState } from 'react';
import { useCreateBlockNote, SuggestionMenuController, FormattingToolbarController, getDefaultReactSlashMenuItems } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '../../../../lib/blocks/core/coreBlocks.css';
import { createEditorSchema } from '../../../../lib/blocks/schema';
import { discoverClientBlockSpecs } from '../../../../lib/blocks/discoverClient';
import { getCoreSlashMenuItems } from '../../../../lib/blocks/core/slashMenu';
import { uploadImage } from '../../../../lib/blocks/core/uploadImage';
import { CustomFormattingToolbar } from '../../../../lib/blocks/core/FontStyleToolbar.jsx';

// value: the stored body as a JSON-stringified block array (or '' / null
// for new content). onChange receives the same JSON-stringified shape, so
// callers can treat it exactly like the TinyMCE-based editors it replaces.
export default function BlockEditor({ value, onChange }) {
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

  const initialContent = useMemo(() => {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  if (!schema) {
    return <div className="text-muted">Chargement de l&apos;éditeur...</div>;
  }

  return <Editor schema={schema} initialContent={initialContent} onChange={onChange} />;
}

// Split out so useCreateBlockNote (which can't be re-initialized with a
// new schema/initialContent after mount) only ever mounts once schema and
// initialContent are both known.
function Editor({ schema, initialContent, onChange }) {
  const editor = useCreateBlockNote({
    schema,
    initialContent,
    uploadFile: uploadImage,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      slashMenu={false}
      formattingToolbar={false}
      onChange={() => onChange(JSON.stringify(editor.document))}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) => {
          const items = [...getDefaultReactSlashMenuItems(editor), ...getCoreSlashMenuItems(editor)];
          const q = query.toLowerCase();
          return items.filter(
            (item) => item.title.toLowerCase().includes(q) || (item.aliases || []).some((a) => a.toLowerCase().includes(q))
          );
        }}
      />
      {/* Adds font-size/font-family selects to the default toolbar (see
          FontStyleToolbar.jsx) — same override pattern as the slash menu
          above: disable the view's own default, mount a customized one
          instead. */}
      <FormattingToolbarController formattingToolbar={CustomFormattingToolbar} />
    </BlockNoteView>
  );
}
