import { createReactBlockSpec } from '@blocknote/react';

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

// A full-width background image with its children (any blocks — usually
// a heading, maybe a paragraph and a button) overlaid on top. This is
// the CMS's answer to a per-page hero banner: instead of a theme
// hardcoding one banner image per page template, an editor drops a Cover
// block at the top of the page and edits everything about it — the
// image, the overlay darkness, and the overlaid content — like any other
// block. Its own render() only produces the background + overlay; the
// overlaid content is its `children`, styled by coreBlocks.css to sit on
// top (see that file for why children can't just be nested inside this
// component's own JSX).
const coverSpec = createReactBlockSpec(
  {
    type: 'cover',
    propSchema: {
      imageUrl: { default: '' },
      overlayOpacity: { default: 40 },
      minHeight: { default: 360 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const editable = editor.isEditable;
      const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadImage(file);
        editor.updateBlock(block, { props: { imageUrl: url } });
      };
      return (
        <div
          className="omega-cover"
          style={{
            backgroundImage: block.props.imageUrl ? `url(${block.props.imageUrl})` : undefined,
            minHeight: `${block.props.minHeight}px`,
            '--omega-cover-overlay': block.props.overlayOpacity / 100,
          }}
        >
          {editable && (
            <div className="omega-cover-settings">
              <input type="file" accept="image/*" onChange={onFile} />
              <label>
                Assombrissement
                <input
                  type="range"
                  min="0"
                  max="90"
                  defaultValue={block.props.overlayOpacity}
                  onChange={(e) => editor.updateBlock(block, { props: { overlayOpacity: Number(e.target.value) } })}
                />
              </label>
            </div>
          )}
        </div>
      );
    },
  }
);

export const cover = coverSpec();
