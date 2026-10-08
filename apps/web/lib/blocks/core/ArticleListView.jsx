'use client';
// Split out from articleList.jsx so that file (imported server-side too,
// via schema.js/render.js) never needs 'use client' itself — same pattern
// as accordionRenderers.jsx, see its comment.
import { useEffect, useState } from 'react';
import ArticleCard from '../../../app/components/article/ArticleCard';
import { routing } from '../../../i18n/routing';

// Locale the visitor is currently browsing, read off the URL as
// next-intl's 'as-needed' routing writes it (see i18n/routing.js): no
// prefix for the default locale, "/en/..." for English. This block also
// renders inside the admin editor (no locale there, so the default one),
// hence not reading it from next-intl's context.
function currentLocale() {
  if (typeof window === 'undefined') return routing.defaultLocale;
  const first = window.location.pathname.split('/')[1];
  return routing.locales.includes(first) ? first : routing.defaultLocale;
}

function useLatestArticles(count, locale) {
  const [state, setState] = useState({ status: 'loading', articles: [] });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/search?page=1&pageSize=${count}&locale=${locale}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => !cancelled && setState({ status: 'ready', articles: json.data ?? [] }))
      .catch(() => !cancelled && setState({ status: 'error', articles: [] }));
    return () => {
      cancelled = true;
    };
  }, [count, locale]);

  return state;
}

export default function ArticleListView({ block, editor }) {
  const editable = editor.isEditable;
  const { count, columns, buttonLabel } = block.props;
  const locale = currentLocale();
  const { status, articles } = useLatestArticles(count, locale);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

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
