import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Excludes /admin and /auth (both kept single-language, outside
  // app/[locale] — see routing.js; /auth was missed on the first pass
  // here, which meant /auth/signin and /auth/signup were incorrectly
  // swept into locale routing and resolved against [locale]/[slug]
  // instead — confirmed the same way a /dev-block-test test page was,
  // which is what surfaced this), /api (this app's own route handlers,
  // e.g. /api/revalidate, which don't need locale negotiation), Next's
  // own internals, and any request for a file with an extension (static
  // assets, favicon, theme CSS/images). Any other new top-level route
  // added outside app/[locale] needs adding here too — there's no way to
  // make this matcher automatically aware of the app's own folder
  // structure.
  matcher: ['/((?!admin|auth|api|_next|_vercel|.*\\..*).*)'],
};
