'use client';
import { useEffect, useMemo, useState } from 'react';
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '../../../../lib/blocks/core/coreBlocks.css';
import { createEditorSchema } from '../../../../lib/blocks/schema';
import { discoverClientBlockSpecs } from '../../../../lib/blocks/discoverClient';
import { getCoreSlashMenuItems } from '../../../../lib/blocks/core/slashMenu';

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file, file.name);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/create-article`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Erreur lors de l'upload de l'image");

  const data = await res.json();
  return data.url;
}

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
    <BlockNoteView editor={editor} theme="light" slashMenu={false} onChange={() => onChange(JSON.stringify(editor.document))}>
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
    </BlockNoteView>
  );
}
