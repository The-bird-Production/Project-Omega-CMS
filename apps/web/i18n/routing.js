import { defineRouting } from 'next-intl/routing';

// 'as-needed': the default locale (fr, the site's original and only
// locale until now) keeps its existing unprefixed URLs (/, /contact) so
// nothing already indexed/bookmarked breaks — only non-default locales
// get a prefix (/en, /en/contact). Admin routes (apps/web/app/admin/**)
// deliberately live outside this: they're not nested under app/[locale],
// and middleware.js's matcher excludes /admin entirely, so the backend
// stays single-language (French) regardless of site content locales.
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
