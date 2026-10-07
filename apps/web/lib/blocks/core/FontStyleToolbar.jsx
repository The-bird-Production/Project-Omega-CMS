'use client';
// The toolbar UI for textStyles.js's fontSize/fontFamily styles — split
// into its own 'use client' file for the same reason as
// accordionRenderers.jsx: textStyles.js needs to stay import-safe from
// server code (schema.js/render.js), and a 'use client' file's exports
// all become opaque client-reference stubs when imported server-side.
// Only ever actually imported by BlockEditor.jsx (already 'use client'),
// so this file itself is never reached from server code.
import { useEffect, useState } from 'react';
import { useComponentsContext, useBlockNoteEditor, useEditorState, FormattingToolbar, getFormattingToolbarItems } from '@blocknote/react';
import { FONT_SIZES, FONT_FAMILIES } from './textStyles.js';

function useStyleSelectItems(styleType, options) {
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();
  const activeValue = useEditorState({
    editor,
    selector: ({ editor }) => editor.getActiveStyles()[styleType] || '',
  });

  if (!editor.isEditable) return null;

  const items = options.map((option) => ({
    text: option.label,
    icon: null,
    isSelected: (activeValue || '') === option.value,
    onClick: () => {
      editor.focus();
      if (option.value) {
        editor.addStyles({ [styleType]: option.value });
      } else {
        editor.removeStyles({ [styleType]: true });
      }
    },
  }));

  return <Components.FormattingToolbar.Select className="bn-select" items={items} />;
}

export function FontSizeSelect() {
  return useStyleSelectItems('fontSize', FONT_SIZES);
}

// Fonts an admin uploaded under Thèmes > Polices personnalisées. Their
// @font-face rules are already loaded on every page (see app/layout.js), so
// choosing one here only needs the family name. Fetched once per page load
// (a failed fetch isn't cached, so the next toolbar mount retries).
let customFamiliesPromise = null;
function loadCustomFamilies() {
  if (!customFamiliesPromise) {
    customFamiliesPromise = fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fonts/all`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data) => [...new Set((data.data || []).map((font) => font.family))])
      .catch(() => {
        customFamiliesPromise = null;
        return [];
      });
  }
  return customFamiliesPromise;
}

export function FontFamilySelect() {
  const [customFamilies, setCustomFamilies] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadCustomFamilies().then((families) => {
      if (!cancelled) setCustomFamilies(families);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Same escaping as the API's generated @font-face rule, so the quoted
  // name matches the declared one exactly.
  const customOptions = customFamilies.map((family) => ({
    label: `${family} (importée)`,
    value: `"${family.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}", sans-serif`,
  }));
  return useStyleSelectItems('fontFamily', [...FONT_FAMILIES, ...customOptions]);
}

// Passed to <FormattingToolbarController formattingToolbar={...}> in
// BlockEditor.jsx (with the view's own default toolbar turned off via
// formattingToolbar={false}) — same override pattern already used for the
// slash menu (slashMenu={false} + a custom <SuggestionMenuController>).
export function CustomFormattingToolbar() {
  return (
    <FormattingToolbar>
      {[...getFormattingToolbarItems(), <FontSizeSelect key="fontSizeSelect" />, <FontFamilySelect key="fontFamilySelect" />]}
    </FormattingToolbar>
  );
}
