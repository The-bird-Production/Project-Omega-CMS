'use client';
// Split out from articleList.jsx so that file (imported server-side too,
// via schema.js/render.js) never needs 'use client' itself — same pattern
// as accordionRenderers.jsx, see its comment.
import { useEffect, useState } from 'react';
import ArticleCard from '../../../app/components/article/ArticleCard';
import { routing } from '../../../i18n/routing';

// URL prefix of the locale the visitor is currently browsing, matching
// next-intl's 'as-needed' routing (see i18n/routing.js): none for the
// default locale, "/en" for English... This block also renders inside
// the admin editor (no locale there), hence reading it off the URL
// rather than from next-intl's context.
function currentLocalePrefix() {
  if (typeof window === 'undefined') return '';
  const first = window.location.pathname.split('/')[1];
  return routing.locales.includes(first) && first !== routing.defaultLocale ? `/${first}` : '';
}

function useLatestArticles(count) {
  const [state, setState] = useState({ status: 'loading', articles: [] });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/search?page=1&pageSize=${count}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => !cancelled && setState({ status: 'ready', articles: json.data ?? [] }))
      .catch(() => !cancelled && setState({ status: 'error', articles: [] }));
    return () => {
      cancelled = true;
    };
  }, [count]);

  return state;
}

export default function ArticleListView({ block, editor }) {
  const editable = editor.isEditable;
  const { count, columns, buttonLabel } = block.props;
  const { status, articles } = useLatestArticles(count);
  const prefix = currentLocalePrefix();

  let content;
  if (status === 'loading') {
    content = <div className="omega-embed-placeholder">Chargement des articles…</div>;
  } else if (status === 'error') {
    content = <div className="omega-embed-placeholder">Impossible de charger les articles.</div>;
  } else if (articles.length === 0) {
    content = <div className="omega-embed-placeholder">Aucun article publié pour le moment.</div>;
  } else {
    content = (
      <div className="omega-article-grid" data-columns={columns} style={{ '--omega-article-columns': columns }}>
        {articles.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            href={`${prefix}/article/${a.slug}`}
            buttonLabel={buttonLabel || "Lire l'article"}
            // In the editor the card is a preview, not a link to follow.
            onLinkClick={editable ? (e) => e.preventDefault() : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="omega-article-list">
      {content}
      {editable && (
        <div className="omega-block-button-settings">
          <label>
            Nombre d&apos;articles
            <input
              type="number"
              min="1"
              max="50"
              defaultValue={count}
              onBlur={(e) => editor.updateBlock(block, { props: { count: Math.min(50, Math.max(1, Number(e.target.value) || 6)) } })}
            />
          </label>
          <label>
            Colonnes
            <select
              defaultValue={columns}
              onChange={(e) => editor.updateBlock(block, { props: { columns: Number(e.target.value) } })}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
          <input
            type="text"
            placeholder="Texte du bouton"
            defaultValue={buttonLabel}
            onBlur={(e) => editor.updateBlock(block, { props: { buttonLabel: e.target.value } })}
          />
        </div>
      )}
    </div>
  );
}
