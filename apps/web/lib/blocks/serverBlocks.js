import { createBlockSpec } from '@blocknote/core';
import { blocksToPlainText, firstImageUrl } from './text.js';
import { fixLegacyUploadUrls } from './legacyUrls.js';

// Server-side (HTML export) versions of the core blocks in ./core/.
//
// The core blocks are React components (createReactBlockSpec), and
// BlockNote's headless HTML export can't render those: each one came out
// as an empty <span>, so the server bailed out to rendering the whole
// page in the browser (see render.js) — and search engines that don't
// run JavaScript saw nothing but the theme's header and footer on every
// page built with a banner, columns, buttons, an accordion...
//
// These produce the same read-only markup as the React versions do on the
// public site (same classes, so coreBlocks.css and the theme's Bootstrap
// styles apply unchanged), as plain DOM, which the export handles. The
// few things the React versions do to *neighbouring* elements after
// mounting (accordion classes on the children container, etc.) are done
// by finalizeBlockHtml() below, on the exported HTML. Keep both versions
// in sync when changing a core block's public markup.

// Extra props the server sets before exporting (see render.js) — data a
// plain DOM render can't fetch or know by itself.
const SERVER_ONLY_PROPS = {
  omegaFirst: { default: false }, // cover: first block of the page
  omegaArticles: { default: '' }, // articleList: JSON of the articles to show
  omegaLinkPrefix: { default: '' }, // articleList: locale prefix for links ("/en")
};

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'style') Object.assign(el.style, value);
    else if (key === 'text') el.textContent = String(value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [].concat(children)) {
    if (child) el.append(child);
  }
  return el;
}

const spec = (type, propSchema, content, render) =>
  createBlockSpec({ type, propSchema, content }, { render: (block, editor) => render(block, editor) })();

const BUTTON_VARIANTS = { primary: 'btn-primary', outline: 'btn-outline-primary', text: 'btn-link' };

const columns = spec('columns', {}, 'none', () => ({ dom: h('div', { class: 'omega-columns' }) }));
const column = spec('column', {}, 'none', () => ({ dom: h('div', { class: 'omega-column' }) }));

const cover = spec(
  'cover',
  {
    imageUrl: { default: '' },
    overlayOpacity: { default: 40 },
    minHeight: { default: '70vh' },
    omegaFirst: SERVER_ONLY_PROPS.omegaFirst,
  },
  'none',
  (block) => {
    const dom = h('div', { class: 'omega-cover' });
    if (block.props.imageUrl) dom.style.backgroundImage = `url("${String(block.props.imageUrl).replace(/"/g, '%22')}")`;
    dom.style.minHeight = block.props.minHeight;
    // Pulls a hero placed first up under the theme's navbar — see cover.jsx.
    if (block.props.omegaFirst) dom.style.marginTop = '-3rem';
    dom.style.setProperty('--omega-cover-overlay', String(Number(block.props.overlayOpacity) / 100));
    return { dom };
  }
);

const buttons = spec('buttons', { align: { default: 'left' } }, 'none', (block) => ({
  dom: h('div', { class: `omega-buttons-row omega-buttons-align-${block.props.align}` }),
}));

const button = spec(
  'button',
  { url: { default: '' }, variant: { default: 'primary' }, openInNewTab: { default: false } },
  'inline',
  (block) => {
    const label = h('span');
    const link = h(
      'a',
      {
        class: `btn ${BUTTON_VARIANTS[block.props.variant] || BUTTON_VARIANTS.primary}`,
        href: block.props.url || '#',
        target: block.props.openInNewTab ? '_blank' : undefined,
        rel: block.props.openInNewTab ? 'noopener noreferrer' : undefined,
      },
      label
    );
    return { dom: h('div', { class: 'omega-block-button-wrap' }, link), contentDOM: label };
  }
);

const accordion = spec('accordion', {}, 'none', () => ({ dom: h('div', { class: 'omega-accordion' }) }));

const accordionItem = spec(
  'accordionItem',
  { question: { default: 'Question' }, open: { default: false } },
  'none',
  (block) => {
    const open = Boolean(block.props.open);
    const collapseId = `omega-accordion-${block.id}`;
    const toggle = h('button', {
      type: 'button',
      class: `accordion-button${open ? '' : ' collapsed'}`,
      'data-bs-toggle': 'collapse',
      'data-bs-target': `#${collapseId}`,
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': collapseId,
      text: block.props.question,
    });
    return {
      dom: h('h2', { class: 'accordion-header', 'data-omega-accordion-item': collapseId, 'data-open': open ? 'true' : 'false' }, toggle),
    };
  }
);

const galleryImage = spec('galleryImage', { url: { default: '' }, alt: { default: '' } }, 'none', (block) => {
  if (!block.props.url) return { dom: h('div', { class: 'omega-gallery-image-placeholder', text: 'Image' }) };
  return {
    dom: h('div', { class: 'omega-gallery-image-cell' }, h('img', { class: 'omega-gallery-image', src: block.props.url, alt: block.props.alt || '', loading: 'lazy' })),
  };
});

// Same Bootstrap carousel as gallery.jsx's read-only view, built from the
// galleryImage children's data (the children themselves are hidden by
// coreBlocks.css thanks to .omega-gallery-carousel-active).
const gallery = spec('gallery', {}, 'none', (block) => {
  const images = (block.children || []).filter((child) => child.type === 'galleryImage' && child.props?.url);
  const dom = h('div', { class: 'omega-gallery omega-gallery-carousel-active' });
  if (images.length === 0) return { dom };

  const id = `omega-gallery-${block.id}`;
  const control = (dir, label) =>
    h('button', { class: `carousel-control-${dir}`, type: 'button', 'data-bs-target': `#${id}`, 'data-bs-slide': dir }, [
      h('span', { class: `carousel-control-${dir}-icon`, 'aria-hidden': 'true' }),
      h('span', { class: 'visually-hidden', text: label }),
    ]);
  dom.append(
    h('div', { id, class: 'carousel slide' }, [
      h(
        'div',
        { class: 'carousel-indicators' },
        images.map((_, i) =>
          h('button', {
            type: 'button',
            'data-bs-target': `#${id}`,
            'data-bs-slide-to': i,
            class: i === 0 ? 'active' : undefined,
            'aria-current': i === 0 ? 'true' : undefined,
            'aria-label': `Photo ${i + 1}`,
          })
        )
      ),
      h(
        'div',
        { class: 'carousel-inner' },
        images.map((image, i) =>
          h('div', { class: `carousel-item${i === 0 ? ' active' : ''}` },
            h('img', { src: image.props.url, alt: image.props.alt || '', class: 'd-block w-100', loading: i === 0 ? undefined : 'lazy' }))
        )
      ),
      control('prev', 'Précédent'),
      control('next', 'Suivant'),
    ])
  );
  return { dom };
});

const spacer = spec('spacer', { height: { default: 48 } }, 'none', (block) => ({
  dom: h('div', { style: { height: `${Number(block.props.height) || 0}px`, position: 'relative' } }),
}));

const embed = spec('embed', { url: { default: '' }, height: { default: 480 } }, 'none', (block) => {
  const height = `${Number(block.props.height) || 480}px`;
  const inner = block.props.url
    ? h('iframe', { class: 'omega-embed-frame', src: block.props.url, title: 'Contenu intégré', loading: 'lazy', style: { height } })
    : h('div', { class: 'omega-embed-placeholder', style: { minHeight: height }, text: 'Contenu indisponible' });
  return { dom: h('div', { class: 'omega-embed' }, inner) };
});

const contactForm = spec('contactForm', {}, 'none', () => ({
  dom: h('form', { class: 'omega-contact-form' }, [
    h('input', { type: 'email', placeholder: 'Adresse e-mail', disabled: true }),
    h('input', { type: 'text', placeholder: 'Sujet', disabled: true }),
    h('input', { type: 'tel', placeholder: 'Téléphone', disabled: true }),
    h('textarea', { placeholder: 'Message', rows: 4, disabled: true }),
    h('button', { type: 'submit', class: 'omega-btn omega-btn-primary', disabled: true, text: 'Envoyer' }),
  ]),
}));

// Same cards as app/components/article/ArticleCard.jsx.
function articleCard(article, href, buttonLabel) {
  const thumbnail = article.image || firstImageUrl(fixLegacyUploadUrls(article.body));
  const text = blocksToPlainText(article.body);
  const excerpt = text.length > 160 ? `${text.slice(0, 160).trimEnd()}…` : text;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  return h('article', { class: 'omega-article-card' }, [
    thumbnail
      ? h('img', { class: 'omega-article-card-img', src: thumbnail, alt: '', loading: 'lazy' })
      : h('div', { class: 'omega-article-card-img omega-article-card-img-empty', 'aria-hidden': 'true' }),
    h('div', { class: 'omega-article-card-body' }, [
      date && h('small', { class: 'omega-article-card-date', text: date }),
      h('h3', { class: 'omega-article-card-title', text: article.title }),
      excerpt && h('p', { class: 'omega-article-card-excerpt', text: excerpt }),
      h('div', { class: 'omega-article-card-footer' }, h('a', { href, class: 'btn btn-primary', text: buttonLabel })),
    ]),
  ]);
}

const articleList = spec(
  'articleList',
  {
    count: { default: 6 },
    columns: { default: 3 },
    buttonLabel: { default: "Lire l'article" },
    omegaArticles: SERVER_ONLY_PROPS.omegaArticles,
    omegaLinkPrefix: SERVER_ONLY_PROPS.omegaLinkPrefix,
  },
  'none',
  (block) => {
    let articles = [];
    try {
      articles = JSON.parse(block.props.omegaArticles || '[]');
    } catch {
      articles = [];
    }
    const dom = h('div', { class: 'omega-article-list' });
    if (articles.length === 0) {
      dom.append(h('div', { class: 'omega-embed-placeholder', text: 'Aucun article publié pour le moment.' }));
      return { dom };
    }
    const grid = h('div', { class: 'omega-article-grid', 'data-columns': block.props.columns });
    grid.style.setProperty('--omega-article-columns', String(block.props.columns));
    for (const a of articles) {
      grid.append(articleCard(a, `${block.props.omegaLinkPrefix}/article/${encodeURIComponent(a.slug)}`, block.props.buttonLabel || "Lire l'article"));
    }
    dom.append(grid);
    return { dom };
  }
);

export const serverCoreBlockSpecs = {
  columns,
  column,
  cover,
  buttons,
  button,
  accordion,
  accordionItem,
  galleryImage,
  gallery,
  spacer,
  embed,
  contactForm,
  articleList,
};

// Children container of the block whose content element is `content`
// (exported HTML: .bn-block > .bn-block-content + .bn-block-group).
function childrenGroup(content) {
  const blockEl = content.closest('.bn-block');
  return blockEl ? blockEl.querySelector(':scope > .bn-block-group') : null;
}

// Post-processes exported HTML (in `root`, a DOM node) so it matches what
// the React read-only view produces on the public site:
// - wraps each core block's content element in a <div>, the extra level
//   React's node view adds — coreBlocks.css's layout rules (columns,
//   buttons, cover, gallery, accordion) are written against it
//   (`.bn-block:has(> * > [data-content-type=...])`);
// - adds the Bootstrap accordion classes accordionRenderers.jsx sets on
//   neighbouring elements after mounting (the collapsible answer is the
//   item's children container, which its own render can't reach).
export function finalizeBlockHtml(root) {
  for (const type of Object.keys(serverCoreBlockSpecs)) {
    for (const content of root.querySelectorAll(`.bn-block > .bn-block-content[data-content-type="${type}"]`)) {
      const wrapper = content.ownerDocument.createElement('div');
      wrapper.className = 'omega-node-view';
      content.replaceWith(wrapper);
      wrapper.append(content);
    }
  }

  for (const marker of root.querySelectorAll('[data-content-type="accordion"]')) {
    childrenGroup(marker)?.classList.add('accordion');
  }
  for (const header of root.querySelectorAll('[data-omega-accordion-item]')) {
    const blockEl = header.closest('.bn-block');
    blockEl?.closest('.bn-block-outer')?.classList.add('accordion-item');
    const group = childrenGroup(header);
    if (!group) continue;
    group.id = header.getAttribute('data-omega-accordion-item');
    group.classList.add('accordion-collapse', 'collapse', 'accordion-body');
    if (header.getAttribute('data-open') === 'true') group.classList.add('show');
    header.removeAttribute('data-omega-accordion-item');
    header.removeAttribute('data-open');
  }

  // Server-only props end up as data-* attributes on the content element:
  // they're not meant for the page (and the articles JSON is large).
  for (const el of root.querySelectorAll('[data-omega-first], [data-omega-articles], [data-omega-link-prefix]')) {
    el.removeAttribute('data-omega-first');
    el.removeAttribute('data-omega-articles');
    el.removeAttribute('data-omega-link-prefix');
  }
}
