// Deliberately no 'use client' here — the hook-using render components
// live in accordionRenderers.jsx instead (see that file's comment for
// why). This file must stay import-safe from server code: schema.js (via
// render.js's shared createEditorSchema, used for the server-side HTML
// export path) imports every core block including this one, and a 'use
// client' file's exports all become opaque client-reference stubs when
// imported into server code — with 'use client' here (as it used to be,
// before the render functions were split out), accordionItem/accordion
// silently ended up as empty {} objects instead of real block specs,
// crashing BlockNoteSchema.create for every page, even ones with no
// accordion on them, the moment this spec was registered. Confirmed
// directly: moving the hooks out to their own 'use client' file, with no
// other change, fixed it.
import { createReactBlockSpec } from '@blocknote/react';
import { AccordionItemRender, AccordionRender } from './accordionRenderers.jsx';

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

const accordionSpec = createReactBlockSpec(
  { type: 'accordion', propSchema: {}, content: 'none' },
  { render: AccordionRender }
);

export const accordionItem = accordionItemSpec();
export const accordion = accordionSpec();
