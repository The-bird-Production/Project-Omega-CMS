'use client';
import { useEffect, useState } from 'react';
import { EmbedTab, UploadTab, useBlockNoteEditor, useComponentsContext } from '@blocknote/react';
import { fetchImageLibrary } from './imageLibrary';

// The image block's "Téléverser" / "Intégrer" panel plus a tab that lists
// images already on the site (earlier uploads and the active theme's
// assets), so an existing image can be reused with one click instead of
// uploading it again. Passed to FilePanelController in BlockEditor.jsx.
function LibraryTab({ blockId }) {
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();
  const [images, setImages] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchImageLibrary().then((list) => {
      if (!cancelled) setImages(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = (img) => {
    if (!editor.getBlock(blockId)) return;
    editor.updateBlock(blockId, { props: { name: img.name, url: img.url } });
  };

  return (
    <Components.FilePanel.TabPanel className="bn-tab-panel">
      {images === null && <p className="omega-image-picker-status">Chargement...</p>}
      {images?.length === 0 && <p className="omega-image-picker-status">Aucune image disponible.</p>}
      {images?.length > 0 && (
        <div className="omega-image-picker-grid omega-file-panel-library">
          {images.map((img) => (
            <button
              key={img.url}
              type="button"
              className="omega-image-picker-thumb"
              onClick={() => choose(img)}
              title={img.fromTheme ? `${img.name} (thème actif)` : img.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} />
            </button>
          ))}
        </div>
      )}
    </Components.FilePanel.TabPanel>
  );
}

export default function LibraryFilePanel({ blockId }) {
  const Components = useComponentsContext();
  const [loading, setLoading] = useState(false);
  const [openTab, setOpenTab] = useState('Bibliothèque');

  // Not the stock FilePanel: it hardcodes its own two tabs, so build the
  // same panel root with a third one.
  const tabs = [
    { name: 'Téléverser', tabPanel: <UploadTab blockId={blockId} setLoading={setLoading} /> },
    { name: 'Bibliothèque', tabPanel: <LibraryTab blockId={blockId} /> },
    { name: 'Intégrer', tabPanel: <EmbedTab blockId={blockId} /> },
  ];

  return (
    <Components.FilePanel.Root
      className="bn-panel"
      defaultOpenTab={openTab}
      openTab={openTab}
      setOpenTab={setOpenTab}
      tabs={tabs}
      loading={loading}
    />
  );
}
