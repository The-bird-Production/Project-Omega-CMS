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

// A single photo — deliberately its own block (rather than a JSON-encoded
// list in a prop) so it reuses BlockNote's own drag-to-reorder for free,
// exactly like any other nested block.
const galleryImageSpec = createReactBlockSpec(
  {
    type: 'galleryImage',
    propSchema: {
      url: { default: '' },
      alt: { default: '' },
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
        editor.updateBlock(block, { props: { url } });
      };
      if (!block.props.url) {
        return (
          <div className="omega-gallery-image-placeholder">
            {editable ? <input type="file" accept="image/*" onChange={onFile} /> : 'Image'}
          </div>
        );
      }
      return (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="omega-gallery-image" src={block.props.url} alt={block.props.alt} />
          {editable && (
            <input
              className="omega-block-inline-input"
              placeholder="Texte alternatif"
              defaultValue={block.props.alt}
              onBlur={(e) => editor.updateBlock(block, { props: { alt: e.target.value } })}
            />
          )}
        </div>
      );
    },
  }
);

const gallerySpec = createReactBlockSpec(
  { type: 'gallery', propSchema: {}, content: 'none' },
  { render: () => <div className="omega-gallery" /> }
);

export const galleryImage = galleryImageSpec();
export const gallery = gallerySpec();
