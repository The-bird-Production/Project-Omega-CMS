import { blocksToPlainText, firstImageUrl } from '../../../lib/blocks/text';
import { fixLegacyUploadUrls } from '../../../lib/blocks/legacyUrls';
import './ArticleCard.css';

const EXCERPT_LENGTH = 160;

// One published article as a card (thumbnail, title, date, excerpt and a
// button to open it). Shared by the public /article list and the
// "Liste d'articles" editor block (lib/blocks/core/articleList.jsx), so
// both look the same. `LinkComponent` lets the server-rendered list use
// next-intl's locale-aware Link while the block (which also renders
// inside the admin editor, outside any locale) uses a plain <a>.
export default function ArticleCard({ article, href, buttonLabel, LinkComponent = 'a', onLinkClick }) {
  const thumbnail = article.image || firstImageUrl(fixLegacyUploadUrls(article.body));
  const text = blocksToPlainText(article.body);
  const excerpt = text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className="omega-article-card">
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- images come from the API's own host, not next/image's configured domains
        <img className="omega-article-card-img" src={thumbnail} alt="" loading="lazy" />
      ) : (
        <div className="omega-article-card-img omega-article-card-img-empty" aria-hidden="true" />
      )}
      <div className="omega-article-card-body">
        {date && <small className="omega-article-card-date">{date}</small>}
        <h3 className="omega-article-card-title">{article.title}</h3>
        {excerpt && <p className="omega-article-card-excerpt">{excerpt}</p>}
        <div className="omega-article-card-footer">
          <LinkComponent href={href} className="btn btn-primary" onClick={onLinkClick}>
            {buttonLabel}
          </LinkComponent>
        </div>
      </div>
    </article>
  );
}
