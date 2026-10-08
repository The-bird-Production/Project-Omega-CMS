import { createReactBlockSpec } from '@blocknote/react';

const DEFAULT_HEIGHT = 480;

// Services usually hand out a ready-made `<iframe src="..." width="560"
// height="315" ...>` snippet rather than a bare URL, and pasting that
// whole snippet into the URL field is the natural thing to do. Keep only
// its src (and its height, if it set one, as a starting point) — the
// width is deliberately ignored: the frame always fills its column.
export function parseEmbedInput(value) {
  const input = (value || '').trim();
  if (!/^<iframe[\s>]/i.test(input)) return { url: input };
  const src = input.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1] || '';
  const height = Number(input.match(/\sheight\s*=\s*["']?(\d+)/i)?.[1]);
  return { url: src.replace(/&amp;/g, '&'), height: height > 0 ? height : undefined };
}

// A generic iframe embed — booking widgets, webcams, maps, anything a
// third-party service hands you as a plain URL. No provider-specific
// logic on purpose: the URL is just whatever the service gives you.
// Always as wide as wherever it's placed (page, column...) — only the
// height is configurable.
const embedSpec = createReactBlockSpec(
  {
    type: 'embed',
    propSchema: {
      url: { default: '' },
      height: { default: DEFAULT_HEIGHT },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const editable = editor.isEditable;
      return (
        <div className="omega-embed">
          {block.props.url ? (
            <iframe className="omega-embed-frame" src={block.props.url} style={{ height: `${block.props.height}px` }} title="Contenu intégré" />
          ) : (
            <div className="omega-embed-placeholder" style={{ minHeight: `${block.props.height}px` }}>
              {editable ? 'Renseignez une URL (ou collez le code <iframe>) ci-dessous' : 'Contenu indisponible'}
            </div>
          )}
          {editable && (
            <div className="omega-block-button-settings">
              <input
                type="text"
                placeholder="https://... ou <iframe ...>"
                defaultValue={block.props.url}
                onBlur={(e) => {
                  const { url, height } = parseEmbedInput(e.target.value);
                  e.target.value = url;
                  editor.updateBlock(block, { props: height ? { url, height } : { url } });
                }}
              />
              <label className="omega-embed-height">
                Hauteur
                <input
                  type="number"
                  min="50"
                  step="10"
                  key={block.props.height}
                  defaultValue={block.props.height}
                  onBlur={(e) => editor.updateBlock(block, { props: { height: Number(e.target.value) || DEFAULT_HEIGHT } })}
                />
                px
              </label>
            </div>
          )}
        </div>
      );
    },
  }
);

export const embed = embedSpec();
