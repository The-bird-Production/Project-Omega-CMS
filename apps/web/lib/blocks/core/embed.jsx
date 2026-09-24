import { createReactBlockSpec } from '@blocknote/react';

// A generic iframe embed — booking widgets, webcams, maps, anything a
// third-party service hands you as a plain URL. No provider-specific
// logic on purpose: the URL is just whatever the service gives you.
const embedSpec = createReactBlockSpec(
  {
    type: 'embed',
    propSchema: {
      url: { default: '' },
      height: { default: 480 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const editable = editor.isEditable;
      return (
        <div>
          {block.props.url ? (
            <iframe className="omega-embed-frame" src={block.props.url} style={{ height: `${block.props.height}px` }} title="Contenu intégré" />
          ) : (
            <div className="omega-embed-placeholder" style={{ minHeight: `${block.props.height}px` }}>
              {editable ? 'Renseignez une URL ci-dessous' : 'Contenu indisponible'}
            </div>
          )}
          {editable && (
            <div className="omega-block-button-settings">
              <input
                type="text"
                placeholder="https://..."
                defaultValue={block.props.url}
                onBlur={(e) => editor.updateBlock(block, { props: { url: e.target.value } })}
              />
              <input
                type="number"
                style={{ width: 90 }}
                defaultValue={block.props.height}
                onBlur={(e) => editor.updateBlock(block, { props: { height: Number(e.target.value) || 480 } })}
              />
            </div>
          )}
        </div>
      );
    },
  }
);

export const embed = embedSpec();
