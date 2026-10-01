import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// requestLocale comes from middleware.js (via the URL's locale prefix, or
// its absence for the default locale) for public site routes. Admin
// routes (apps/web/app/admin/**) are outside app/[locale] on purpose and
// excluded from middleware.js's matcher, so requestLocale is never set
// for them — they fall through to routing.defaultLocale (fr) here,
// keeping the admin interface single-language regardless of how many
// site-content locales exist.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
