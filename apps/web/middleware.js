import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Excludes /admin (kept single-language, outside app/[locale] — see
  // routing.js), /api (this app's own route handlers, e.g.
  // /api/revalidate, which don't need locale negotiation), Next's own
  // internals, and any request for a file with an extension (static
  // assets, favicon, theme CSS/images).
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
};
