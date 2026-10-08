import { createReactBlockSpec } from '@blocknote/react';
import ArticleListView from './ArticleListView.jsx';

// The latest published articles as a grid of cards, each with a button
// opening the article — drop it on any page (home page, "Blog"...).
// Fetched in the browser, so it always reflects what's published now
// without republishing the page that contains it.
const articleListSpec = createReactBlockSpec(
  {
    type: 'articleList',
    propSchema: {
      count: { default: 6 },
      columns: { default: 3 },
      buttonLabel: { default: "Lire l'article" },
    },
    content: 'none',
  },
  {
    render: (props) => <ArticleListView {...props} />,
  }
);

export const articleList = articleListSpec();
