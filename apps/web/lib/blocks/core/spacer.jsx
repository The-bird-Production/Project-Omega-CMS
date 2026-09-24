import { createReactBlockSpec } from '@blocknote/react';

const spacerSpec = createReactBlockSpec(
  {
    type: 'spacer',
    propSchema: { height: { default: 48 } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div style={{ height: `${block.props.height}px`, position: 'relative' }}>
        {editor.isEditable && (
          <input
            type="number"
            className="omega-block-inline-input"
            style={{ width: 80, position: 'absolute', top: 0, left: 0 }}
            defaultValue={block.props.height}
            onBlur={(e) => editor.updateBlock(block, { props: { height: Number(e.target.value) || 0 } })}
          />
        )}
      </div>
    ),
  }
);

export const spacer = spacerSpec();
