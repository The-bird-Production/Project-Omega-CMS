import { createReactBlockSpec } from '@blocknote/react';
import ImagePicker from './ImagePicker';

// A full-width background image with its children (any blocks — usually
// a heading, maybe a paragraph and a button) overlaid on top. This is
// the CMS's answer to a per-page hero banner: instead of a theme
// hardcoding one banner image per page template, an editor drops a Cover
// block at the top of the page and edits everything about it — the
// image, the overlay darkness, the height, and the overlaid content —
// like any other block. Its own render() only produces the background +
// overlay; the overlaid content is its `children`, styled by
// coreBlocks.css to sit on top (see that file for why children can't
// just be nested inside this component's own JSX).
//
// minHeight is stored as a full CSS length (e.g. "70vh", "480px"), not a
// bare number assumed to be px — a hero banner is usually meant to fill
// most of the viewport regardless of its actual pixel height, which only
// a viewport-relative unit does correctly across screen sizes.
const coverSpec = createReactBlockSpec(
  {
    type: 'cover',
    propSchema: {
      imageUrl: { default: '' },
      overlayOpacity: { default: 40 },
      minHeight: { default: '70vh' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const editable = editor.isEditable;
      // The public site wraps every page's content in Bootstrap's .py-5
      // (see BlockContent.jsx) so ordinary text doesn't sit flush against
      // the theme's own navbar — but a Cover placed first on the page is
      // meant to be a full-bleed hero flush against the very top of the
      // viewport (see the full-bleed width trick in coreBlocks.css), and
      // that padding instead left a blank gap of bare page above it, with
      // the theme's own navbar (usually overlaid transparently on the
      // hero) rendering over nothing. Only relevant in the read-only
      // public view — the editor never wraps content in that padding.
      const isFirstBlock = !editable && editor.document[0]?.id === block.id;
      return (
        <div
          className="omega-cover"
          style={{
            backgroundImage: block.props.imageUrl ? `url(${block.props.imageUrl})` : undefined,
            minHeight: block.props.minHeight,
            marginTop: isFirstBlock ? '-3rem' : undefined,
            '--omega-cover-overlay': block.props.overlayOpacity / 100,
          }}
        >
          {editable && (
            <div className="omega-cover-settings">
              <ImagePicker onSelect={(url) => editor.updateBlock(block, { props: { imageUrl: url } })} />
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
              <label>
                Hauteur
                <input
                  type="text"
                  className="omega-cover-height-input"
                  defaultValue={block.props.minHeight}
                  placeholder="70vh"
                  onBlur={(e) => editor.updateBlock(block, { props: { minHeight: e.target.value || '70vh' } })}
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
