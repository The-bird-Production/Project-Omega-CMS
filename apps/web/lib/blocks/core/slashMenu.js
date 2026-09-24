// Registering a block type with the schema (see index.js) doesn't give it
// a slash-menu entry — BlockNote's own default items are a hardcoded list
// (@blocknote/react's getDefaultReactSlashMenuItems), not derived from the
// schema, and there's no public "insertOrUpdateBlock" helper exported to
// reuse for a custom item either (only an internal one, used by that same
// hardcoded list). So this builds equivalent items by hand, using only
// BlockNoteEditor's public insertBlocks/setTextCursorPosition API.
// Finds the first descendant (depth-first, including the block itself)
// whose own content type isn't 'none' — that's the only kind of block
// setTextCursorPosition can actually target. A pure container (columns,
// accordion, gallery...) has no addressable text position of its own;
// calling setTextCursorPosition on one crashes deep inside BlockNote
// (confirmed: "Cannot read properties of undefined (reading 'isInGroup')").
function findCursorTarget(editor, block) {
  if (editor.schema.blockSchema[block.type]?.content !== 'none') return block;
  for (const child of block.children || []) {
    const found = findCursorTarget(editor, child);
    if (found) return found;
  }
  return null;
}

function insertCoreBlock(editor, blockPartial) {
  const currentBlock = editor.getTextCursorPosition().block;
  const newBlock = editor.insertBlocks([blockPartial], currentBlock, 'after')[0];
  const cursorTarget = findCursorTarget(editor, newBlock);
  if (cursorTarget) editor.setTextCursorPosition(cursorTarget);
}

export function getCoreSlashMenuItems(editor) {
  return [
    {
      key: 'cover',
      title: 'Bannière (Cover)',
      subtext: 'Image de fond pleine largeur avec du texte par-dessus',
      aliases: ['cover', 'banniere', 'hero'],
      group: 'Mise en page',
      onItemClick: () =>
        insertCoreBlock(editor, {
          type: 'cover',
          children: [{ type: 'heading', props: { level: 1 }, content: 'Titre' }],
        }),
    },
    {
      key: 'columns',
      title: 'Colonnes',
      subtext: 'Place du contenu côte à côte',
      aliases: ['colonnes', 'columns'],
      group: 'Mise en page',
      onItemClick: () =>
        insertCoreBlock(editor, {
          type: 'columns',
          children: [
            { type: 'column', children: [{ type: 'paragraph' }] },
            { type: 'column', children: [{ type: 'paragraph' }] },
          ],
        }),
    },
    {
      key: 'buttons',
      title: 'Bouton(s)',
      subtext: 'Un ou plusieurs boutons cliquables',
      aliases: ['bouton', 'button', 'cta', 'lien'],
      group: 'Mise en page',
      onItemClick: () =>
        insertCoreBlock(editor, {
          type: 'buttons',
          children: [{ type: 'button', content: 'Cliquez ici' }],
        }),
    },
    {
      key: 'accordion',
      title: 'Accordéon',
      subtext: 'Questions/réponses repliables (FAQ...)',
      aliases: ['accordeon', 'faq', 'accordion'],
      group: 'Mise en page',
      onItemClick: () =>
        insertCoreBlock(editor, {
          type: 'accordion',
          children: [{ type: 'accordionItem', props: { question: 'Question' }, children: [{ type: 'paragraph' }] }],
        }),
    },
    {
      key: 'spacer',
      title: 'Espacement',
      subtext: 'Ajoute un espace vertical',
      aliases: ['espace', 'spacer', 'vide'],
      group: 'Mise en page',
      onItemClick: () => insertCoreBlock(editor, { type: 'spacer' }),
    },
    {
      key: 'contactForm',
      title: 'Formulaire de contact',
      subtext: 'Formulaire (nom, e-mail, message...)',
      aliases: ['formulaire', 'contact', 'form'],
      group: 'Mise en page',
      onItemClick: () => insertCoreBlock(editor, { type: 'contactForm' }),
    },
    {
      key: 'gallery',
      title: 'Galerie photo',
      subtext: 'Une grille de plusieurs images',
      aliases: ['galerie', 'gallery', 'photos'],
      group: 'Médias',
      onItemClick: () => insertCoreBlock(editor, { type: 'gallery', children: [{ type: 'galleryImage' }] }),
    },
    {
      key: 'embed',
      title: 'Intégration (iframe)',
      subtext: 'Widget de réservation, webcam, carte...',
      aliases: ['embed', 'iframe', 'widget'],
      group: 'Médias',
      onItemClick: () => insertCoreBlock(editor, { type: 'embed' }),
    },
  ];
}
