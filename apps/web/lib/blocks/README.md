# Contributing blocks from a plugin or theme

Pages and articles are edited with a block-based editor
([BlockNote](https://www.blocknotejs.org/)). A plugin or theme can add its
own block type(s) to that editor by shipping a `blocks.js` file:

- **Plugins**: `public/blocks.js` in the plugin's release archive — it's
  copied to `apps/web/app/components/plugin/<pluginId>/blocks.js` on
  install, next to the existing `admin/dashboard.js`.
- **Themes**: `components/blocks.js` — it's copied to
  `apps/web/app/Themes/<themeId>/components/blocks.js` on install, next to
  the theme's other components (dev mode only, same as the theme's other
  components today).

## The contract

`blocks.js` must default-export an object mapping a block type name to a
`BlockSpec` created with `createReactBlockSpec` from `@blocknote/react`:

```js
import { createReactBlockSpec } from '@blocknote/react';

const testimonial = createReactBlockSpec(
  {
    type: 'testimonial',
    propSchema: { author: { default: '' } },
    content: 'inline',
  },
  {
    render: (props) => (
      <blockquote className="testimonial">
        <div ref={props.contentRef} />
        <footer>{props.block.props.author}</footer>
      </blockquote>
    ),
  }
);

export default { testimonial: testimonial() };
```

That's it — once the plugin/theme is installed, `testimonial` shows up as
an insertable block in the editor (see
`apps/web/lib/blocks/discoverClient.js`), and the exact same `render`
function is used to produce the block's HTML on the public site.

**How the public site renders it**: a page/article built entirely from
the built-in block types is rendered to HTML server-side
(`apps/web/lib/blocks/render.js`, via `@blocknote/server-util`) — good for
SEO and first paint. One that uses a plugin/theme block like `testimonial`
falls back to a client-rendered read-only editor view instead
(`BlockContent.jsx` → `BlockContentBranch.jsx` → `BlockContentClient.jsx`):
BlockNote's headless HTML export doesn't reliably render React-based
custom blocks outside a real mounted React tree. In practice this means a
plugin/theme block's `render` function should work correctly when mounted
standalone in the browser (which it already needs to, for the editor) —
no extra work required — but content using one won't be part of the
page's initial server-rendered HTML.

Block type names should be namespaced (e.g. `my-plugin/testimonial`) if
there's any real chance of colliding with another plugin's block — nothing
enforces uniqueness beyond "the last one imported wins".

See the [BlockNote custom blocks docs](https://www.blocknotejs.org/docs/features/custom-schemas/custom-blocks)
for the full `BlockSpec` API (custom props, nested content, etc).
