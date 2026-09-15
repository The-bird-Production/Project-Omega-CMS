import Link from 'next/link';

export default function ArticlePagination({ page, totalPages, searchParams }) {
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
            <span className="page-link">Précédent</span>
          ) : (
            <Link className="page-link" href={hrefForPage(page - 1)}>
              Précédent
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
            <span className="page-link">Suivant</span>
          ) : (
            <Link className="page-link" href={hrefForPage(page + 1)}>
              Suivant
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
