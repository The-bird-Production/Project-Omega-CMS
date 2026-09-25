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
// list in a prop) so it reuses BlockNote's own drag-to-reorder in the
// editor, exactly like any other nested block. In the editor it's just
// one grid cell; on the public site the *gallery* block below renders
// the actual carousel directly from this data instead (see its comment
// for why), so this block's own render() never runs there.
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

// Editable mode: a plain grid, one cell per galleryImage child, using
// BlockNote's normal children mechanism (see coreBlocks.css) — an admin
// adds/reorders/removes photos the same way as any nested block.
//
// Read-only public mode: a real Bootstrap carousel
// (.carousel/.carousel-inner/.carousel-item/indicators/controls),
// so a Bootstrap-based theme's own style.css styles it like any other
// carousel, and Bootstrap's own JS bundle (already loaded globally,
// see apps/web/app/layout.js) drives the slide animation — the same
// upgrade made to the accordion block, for the same reason. Rendered
// directly from `block.children`'s own prop data instead of relying on
// each galleryImage's normal (grid-cell) render, since a carousel's
// .carousel-inner/.carousel-item/indicators are one interlocked
// structure a single image block can't produce on its own; the real
// per-child elements BlockNote still renders alongside this are hidden
// via coreBlocks.css specifically for this read-only case.
const gallerySpec = createReactBlockSpec(
  { type: 'gallery', propSchema: {}, content: 'none' },
  {
    render: ({ block, editor }) => {
      if (editor.isEditable) return <div className="omega-gallery" />;

      const images = (block.children || []).filter((child) => child.type === 'galleryImage' && child.props?.url);
      if (images.length === 0) return <div className="omega-gallery omega-gallery-carousel-active" />;

      const carouselId = `omega-gallery-${block.id}`;
      return (
        <div className="omega-gallery omega-gallery-carousel-active">
          <div id={carouselId} className="carousel slide">
            <div className="carousel-indicators">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  data-bs-target={`#${carouselId}`}
                  data-bs-slide-to={index}
                  className={index === 0 ? 'active' : ''}
                  aria-current={index === 0 ? 'true' : undefined}
                  aria-label={`Photo ${index + 1}`}
                />
              ))}
            </div>
            <div className="carousel-inner">
              {images.map((image, index) => (
                <div className={`carousel-item${index === 0 ? ' active' : ''}`} key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.props.url} alt={image.props.alt || ''} className="d-block w-100" />
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Précédent</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Suivant</span>
            </button>
          </div>
        </div>
      );
    },
  }
);

export const galleryImage = galleryImageSpec();
export const gallery = gallerySpec();
