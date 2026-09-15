import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { prepareBlockContent } from '../../lib/blocks/render';
import BlockContentBranch from './BlockContentBranch';

// Renders a page/article's stored body (JSON-stringified BlockNote
// blocks) — server-rendered HTML for ordinary content (see render.js),
// falling back to a client-rendered read-only editor view for content
// that uses a plugin/theme custom block. Wrapped in the classes
// BlockNote's own stylesheet expects either way, so it looks the same as
// it does in the editor.
export default async function BlockContent({ body, as: Wrapper = 'div', className = '' }) {
  const prepared = await prepareBlockContent(body);
  if (prepared.mode === 'empty') return null;

  return (
    <div className="bn-root bn-container bn-mantine">
      {prepared.mode === 'html' ? (
        <Wrapper
          className={`ProseMirror bn-editor bn-default-styles ${className}`.trim()}
          dangerouslySetInnerHTML={{ __html: prepared.html }}
        />
      ) : (
        <BlockContentBranch Wrapper={Wrapper} className={className} blocks={prepared.blocks} />
      )}
    </div>
  );
}
