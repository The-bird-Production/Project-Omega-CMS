import { button, buttons } from './button.jsx';
import { column, columns } from './columns.jsx';
import { accordionItem, accordion } from './accordion.jsx';
import { galleryImage, gallery } from './gallery.jsx';
import { cover } from './cover.jsx';
import { spacer } from './spacer.jsx';
import { embed } from './embed.jsx';
import { contactForm } from './contactForm.jsx';

// Core "Gutenberg-style" blocks shipped with the CMS itself — always
// available in the page/article editor regardless of which theme/plugin
// is active, unlike the plugin/theme block-contribution mechanism (see
// discoverClient.js/discoverServer.js), which is for third-party blocks.
// See slashMenu.js for how these get inserted (registering a block type
// here doesn't give it a slash-menu entry on its own).
export const coreBlockSpecs = {
  button,
  buttons,
  column,
  columns,
  accordionItem,
  accordion,
  galleryImage,
  gallery,
  cover,
  spacer,
  embed,
  contactForm,
};
