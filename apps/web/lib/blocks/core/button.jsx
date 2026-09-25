import { createReactBlockSpec } from '@blocknote/react';

// Renders as a plain Bootstrap .btn — every Bootstrap-based theme (the
// vast majority of themes in this ecosystem, going by the default theme
// and apdm-omega-theme) already has rich, real styling for that class,
// where a custom .omega-btn class would only ever get this file's own
// generic fallback CSS. `content: 'inline'` gives the label real rich
// text (contentRef), matching Gutenberg's own Button block, rather than
// baking the label into a prop.
const VARIANT_CLASS = {
  primary: 'btn-primary',
  outline: 'btn-outline-primary',
  text: 'btn-link',
};

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
            className={`btn ${VARIANT_CLASS[block.props.variant] || VARIANT_CLASS.primary}`}
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
                <option value="text">Lien seul</option>
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
// Button blocks as its children (indent them under it). Uses Bootstrap's
// own flex utility classes rather than a custom container class, for the
// same reason as the button itself.
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
      // The actual button children render in a separate sibling/child
      // element BlockNote controls (see coreBlocks.css's big comment on
      // why) — this div is only a marker for that CSS to key off of via
      // :has(), not itself the flex container.
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
