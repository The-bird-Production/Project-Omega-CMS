'use client';
import { useEffect, useRef } from 'react';
import { createReactBlockSpec } from '@blocknote/react';

// Real Bootstrap accordion markup (.accordion-item/.accordion-header/
// .accordion-button/.accordion-collapse/.accordion-body) rather than a
// custom hand-rolled toggle — a Bootstrap-based theme's own style.css
// already has rich, real styling for these exact classes (where a
// generic .omega-* class would only ever get this file's own plain
// fallback look), and Bootstrap's own JS bundle (already loaded
// globally, see apps/web/app/layout.js) drives the collapse/expand
// animation on the public site for free.
//
// The answer (this item's children, i.e. whatever's inside the
// accordion body) renders in a completely separate DOM element BlockNote
// itself owns — a block's render() can't wrap it directly (see
// coreBlocks.css's big comment on why, and its exact DOM shape in both
// the editable and read-only renderers). Bootstrap's collapse CSS/JS
// needs THAT element to literally carry .accordion-collapse/.collapse/
// .show and a matching id for data-bs-target to find — so this reaches
// it imperatively via a ref once mounted, rather than trying to control
// it declaratively. Confirmed safe to do: BlockNote never re-renders or
// resets that element's own classList/attributes itself, so nothing
// fights this.
function useAccordionBodyClasses(anchorRef, collapseId, open) {
  useEffect(() => {
    const bnBlock = anchorRef.current?.closest('.bn-block');
    if (!bnBlock) return;

    // This item's own .bn-block-outer wrapper (a sibling of every other
    // accordionItem's, inside the parent accordion block's children
    // container) — Bootstrap's .accordion-item border/radius CSS expects
    // this class on the element wrapping both header and body.
    bnBlock.closest('.bn-block-outer')?.classList.add('accordion-item');

    // Editable admin editor: the children container is .bn-block's own
    // sibling. Read-only public view: it's .bn-block's own child. See
    // coreBlocks.css for how this was confirmed.
    const group = bnBlock.nextElementSibling?.classList.contains('bn-block-group')
      ? bnBlock.nextElementSibling
      : bnBlock.querySelector(':scope > .bn-block-group');
    if (!group) return;

    group.id = collapseId;
    group.classList.add('accordion-collapse', 'collapse', 'accordion-body');
    group.classList.toggle('show', open);
  });
}

// A named, capitalized function (not an inline arrow assigned to
// `render`) purely so eslint's react-hooks rule recognizes this as a
// component and allows the hook calls inside it — BlockNote's own
// `render` config key can't itself be capitalized.
function AccordionItemRender({ block, editor }) {
  const editable = editor.isEditable;
  const anchorRef = useRef(null);
  // A stable id (block.id never changes) for the data-bs-target/
  // aria-controls pairing Bootstrap's collapse JS needs.
  const collapseId = `omega-accordion-${block.id}`;
  useAccordionBodyClasses(anchorRef, collapseId, block.props.open);

  if (editable) {
    // Toggled via this button's own onClick + editor.updateBlock, not
    // Bootstrap's data-bs-toggle click handling — there's no
    // admin-facing reason to need the animation, and this keeps the
    // question editable (a real data-bs-toggle button intercepts clicks
    // in ways that'd fight editing the input inside it).
    const toggle = () => editor.updateBlock(block, { props: { open: !block.props.open } });
    return (
      <h2 className="accordion-header" ref={anchorRef}>
        <button type="button" className={`accordion-button${block.props.open ? '' : ' collapsed'}`} onClick={toggle}>
          <input
            className="omega-accordion-question-input"
            defaultValue={block.props.question}
            onBlur={(e) => editor.updateBlock(block, { props: { question: e.target.value } })}
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      </h2>
    );
  }

  return (
    <h2 className="accordion-header" ref={anchorRef}>
      <button
        type="button"
        className={`accordion-button${block.props.open ? '' : ' collapsed'}`}
        data-bs-toggle="collapse"
        data-bs-target={`#${collapseId}`}
        aria-expanded={block.props.open ? 'true' : 'false'}
        aria-controls={collapseId}
      >
        {block.props.question}
      </button>
    </h2>
  );
}

const accordionItemSpec = createReactBlockSpec(
  {
    type: 'accordionItem',
    propSchema: {
      question: { default: 'Question' },
      open: { default: false },
    },
    content: 'none',
  },
  { render: AccordionItemRender }
);

// Bootstrap's compiled accordion CSS assumes real DOM nesting
// (.accordion > .accordion-item, not just .accordion-item on its own —
// confirmed directly: an .accordion-item's own styling didn't apply at
// all without this) — but the actual accordionItem children render in a
// separate element this block's own render() never touches (see
// coreBlocks.css's big comment). Same ref-based fix as
// useAccordionBodyClasses above: reach the real children container once
// mounted and add the class there instead of on this decorative div.
function AccordionRender() {
  const anchorRef = useRef(null);
  useEffect(() => {
    const bnBlock = anchorRef.current?.closest('.bn-block');
    if (!bnBlock) return;
    const group = bnBlock.nextElementSibling?.classList.contains('bn-block-group')
      ? bnBlock.nextElementSibling
      : bnBlock.querySelector(':scope > .bn-block-group');
    group?.classList.add('accordion');
  });
  return <div className="omega-accordion" ref={anchorRef} />;
}

const accordionSpec = createReactBlockSpec(
  { type: 'accordion', propSchema: {}, content: 'none' },
  { render: AccordionRender }
);

export const accordionItem = accordionItemSpec();
export const accordion = accordionSpec();
