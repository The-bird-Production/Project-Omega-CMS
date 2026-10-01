import { routing } from '../../i18n/routing';

// No actual wrapping needed here — app/layout.js (the real root layout,
// with <html>/<body> and the NextIntlClientProvider) already covers every
// route, including these locale-prefixed ones; see i18n/request.js for
// how it resolves the right locale's messages per request either way.
// This file exists only so Next.js knows which [locale] values are valid
// to statically generate.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children }) {
  return children;
}
