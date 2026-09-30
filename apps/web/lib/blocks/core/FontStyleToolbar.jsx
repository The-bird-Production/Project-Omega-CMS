'use client';
// The toolbar UI for textStyles.js's fontSize/fontFamily styles — split
// into its own 'use client' file for the same reason as
// accordionRenderers.jsx: textStyles.js needs to stay import-safe from
// server code (schema.js/render.js), and a 'use client' file's exports
// all become opaque client-reference stubs when imported server-side.
// Only ever actually imported by BlockEditor.jsx (already 'use client'),
// so this file itself is never reached from server code.
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

export function FontFamilySelect() {
  return useStyleSelectItems('fontFamily', FONT_FAMILIES);
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
