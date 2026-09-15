import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ArticlePagination({ page, totalPages, searchParams }) {
  const t = useTranslations('ArticleList');
  if (totalPages <= 1) return null;

  const hrefForPage = (targetPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(targetPage));
    return `/article?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination des articles">
      <ul className="pagination">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          {page <= 1 ? (
            <span className="page-link">{t('previous')}</span>
          ) : (
            <Link className="page-link" href={hrefForPage(page - 1)}>
              {t('previous')}
            </Link>
          )}
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <Link className="page-link" href={hrefForPage(p)}>
              {p}
            </Link>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          {page >= totalPages ? (
            <span className="page-link">{t('next')}</span>
          ) : (
            <Link className="page-link" href={hrefForPage(page + 1)}>
              {t('next')}
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
