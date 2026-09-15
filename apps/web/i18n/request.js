import { getRequestConfig } from 'next-intl/server';

// Single-locale setup (no [locale] URL segment yet): every request resolves
// to French. Adding a second language later means adding its messages/*.json
// file and switching this to read the locale from a cookie/header/route
// param instead of hardcoding it — the rest of the app already calls
// useTranslations()/getTranslations() rather than hardcoding strings, so
// that swap won't require touching every component again.
export default getRequestConfig(async () => {
  const locale = 'fr';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
