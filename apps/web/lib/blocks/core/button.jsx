import { createReactBlockSpec } from '@blocknote/react';

// A single call-to-action link. `content: 'inline'` gives the label real
// rich text (contentRef), matching Gutenberg's own Button block, rather
// than baking the label into a prop.
const buttonSpec = createReactBlockSpec(
  {
    type: 'button',
    propSchema: {
      url: { default: '' },
      variant: { default: 'primary' },
      openInNewTab: { default: false },
    },
    content: 'inline',
  },
  {
    render: (props) => {
      const { block, editor, contentRef } = props;
      const editable = editor.isEditable;
      return (
        <div className="omega-block-button-wrap">
          <a
            className={`omega-btn omega-btn-${block.props.variant}`}
            href={block.props.url || '#'}
            target={block.props.openInNewTab ? '_blank' : undefined}
            rel={block.props.openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={(e) => editable && e.preventDefault()}
          >
            <span ref={contentRef} />
          </a>
          {editable && (
            <span className="omega-block-button-settings">
              <input
                type="text"
                placeholder="URL du bouton"
                defaultValue={block.props.url}
                onBlur={(e) => editor.updateBlock(block, { props: { url: e.target.value } })}
              />
              <select
                defaultValue={block.props.variant}
                onChange={(e) => editor.updateBlock(block, { props: { variant: e.target.value } })}
              >
                <option value="primary">Plein</option>
                <option value="outline">Contour</option>
                <option value="text">Texte seul</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  defaultChecked={block.props.openInNewTab}
                  onChange={(e) => editor.updateBlock(block, { props: { openInNewTab: e.target.checked } })}
                />
                Nouvel onglet
              </label>
            </span>
          )}
        </div>
      );
    },
  }
);

// A row of buttons placed side by side — insert this first, then add
// Button blocks as its children (indent them under it).
const buttonsSpec = createReactBlockSpec(
  {
    type: 'buttons',
    propSchema: {
      align: { default: 'left' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <div className={`omega-buttons-row omega-buttons-align-${props.block.props.align}`}>
        {props.editor.isEditable && (
          <select
            className="omega-block-inline-select"
            defaultValue={props.block.props.align}
            onChange={(e) => props.editor.updateBlock(props.block, { props: { align: e.target.value } })}
          >
            <option value="left">Gauche</option>
            <option value="center">Centré</option>
            <option value="space-between">Espacés</option>
          </select>
        )}
      </div>
    ),
  }
);

export const button = buttonSpec();
export const buttons = buttonsSpec();
