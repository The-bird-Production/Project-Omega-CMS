import { createReactBlockSpec } from '@blocknote/react';

// The question is a plain string prop (not inline rich text) — its
// children (arbitrary blocks: paragraphs, lists, images...) are the
// answer, shown/hidden via a `data-accordion-open` attribute this reads
// from its own props and the CSS in coreBlocks.css keys off of (its
// children render as a separate sibling element BlockNote controls, so
// this can't just conditionally render them itself — see that file).
const accordionItemSpec = createReactBlockSpec(
  {
    type: 'accordionItem',
    propSchema: {
      question: { default: 'Question' },
      open: { default: false },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const editable = editor.isEditable;
      const toggle = () => editor.updateBlock(block, { props: { open: !block.props.open } });
      return (
        <div className="omega-accordion-item-header" data-accordion-open={String(block.props.open)} onClick={editable ? undefined : toggle}>
          {editable ? (
            <input
              defaultValue={block.props.question}
              onBlur={(e) => editor.updateBlock(block, { props: { question: e.target.value } })}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span>{block.props.question}</span>
          )}
          <span
            className={`omega-accordion-chevron${block.props.open ? ' omega-open' : ''}`}
            onClick={editable ? toggle : undefined}
          >
            ▾
          </span>
        </div>
      );
    },
  }
);

const accordionSpec = createReactBlockSpec(
  { type: 'accordion', propSchema: {}, content: 'none' },
  { render: () => <div className="omega-accordion" /> }
);

export const accordionItem = accordionItemSpec();
export const accordion = accordionSpec();
