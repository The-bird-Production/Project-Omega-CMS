// Deliberately no 'use client' here — the toolbar UI (which uses hooks)
// lives in FontStyleToolbar.jsx instead. This file must stay import-safe
// from server code: schema.js (via render.js's shared createEditorSchema,
// used for the server-side HTML export path) imports it, and a 'use
// client' file's exports all become opaque client-reference stubs when
// imported into server code — accordion.jsx hit exactly this bug (see its
// own comment) for the same reason, with the same fix: keep hook-using
// components in their own 'use client' file, separate from the plain spec
// definitions that server code needs to import directly.
import { createStyleSpec } from '@blocknote/core';

// Custom BlockNote text styles (marks) for font size/family — BlockNote's
// default schema only ships bold/italic/underline/strike/colors, nothing
// for typography. Both render as a plain wrapping <span> with an inline
// style; BlockNote persists the chosen value as a stored mark attribute
// (mark.attrs.stringValue), so it round-trips through the same JSON body
// every other block prop does and renders identically in the read-only
// public view (same shared schema, see schema.js). The render callback
// itself uses no React hooks — just document.createElement — so it needs
// no client boundary of its own.
export const fontSizeStyle = createStyleSpec(
  { type: 'fontSize', propSchema: 'string' },
  {
    render: (value) => {
      const dom = document.createElement('span');
      dom.style.fontSize = value;
      // contentDOM: the marked text itself needs an explicit insertion
      // point — omitting it crashed the server-side HTML export
      // ("Cannot read properties of undefined (reading 'appendChild')"),
      // confirmed directly; a plain content:'none' block's render can
      // get away with omitting it since it has no text content to place.
      return { dom, contentDOM: dom };
    },
  }
);

// Web-safe fonts only (no @font-face/Google Fonts loading) — installed on
// every OS already, so choosing one never risks a broken/missing font on
// a visitor's device, and needs no extra network request either.
export const fontFamilyStyle = createStyleSpec(
  { type: 'fontFamily', propSchema: 'string' },
  {
    render: (value) => {
      const dom = document.createElement('span');
      dom.style.fontFamily = value;
      return { dom, contentDOM: dom };
    },
  }
);

export const FONT_SIZES = [
  { label: 'Petit', value: '0.85rem' },
  { label: 'Normal', value: '' },
  { label: 'Grand', value: '1.25rem' },
  { label: 'Très grand', value: '1.75rem' },
];

export const FONT_FAMILIES = [
  { label: 'Thème (défaut)', value: '' },
  { label: 'Serif (Georgia)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Sans-serif (Arial)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Manuscrite (Verdana)', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Monospace (Courier)', value: '"Courier New", Courier, monospace' },
];
