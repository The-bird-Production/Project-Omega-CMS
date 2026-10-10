import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import Script from 'next/script';
import ClientChrome from './components/layout/ClientChrome';
import { getSiteName } from '../lib/siteName';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// The favicon uploaded in the admin, linked straight from the API (its
// real file name/extension, so a change shows up without waiting on
// /favicon.ico's cache). Without one, /favicon.ico (app/favicon.ico/
// route.js) serves a neutral default.
async function getFaviconUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;
  try {
    const res = await fetch(`${backendUrl}/favicon/current`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    // Built from our own backend URL when the API gives the bare file
    // name: the API's own `url` used to come out as
    // "undefined/favicon/..." when its BACKEND_URL wasn't set.
    if (data.file) return `${backendUrl}/favicon/${data.file}`;
    return data.url || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const t = await getTranslations('Layout');
  const [siteName, faviconUrl] = await Promise.all([getSiteName(), getFaviconUrl()]);

  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: t('siteDescription'),
    openGraph: {
      siteName,
      type: "website",
    },
    icons: { icon: faviconUrl || '/favicon.ico' },
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {/* @font-face rules for every admin-uploaded custom font (see
            apps/admin/themes — "Polices personnalisées") — a plain CSS
            endpoint, empty (but always valid) when none have been
            uploaded yet, so this is harmless to always include. */}
        {process.env.NEXT_PUBLIC_BACKEND_URL && (
          <link rel="stylesheet" href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/fonts/css`} />
        )}
      </head>

      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientChrome>{children}</ClientChrome>
        </NextIntlClientProvider>
        {/* Loaded once, globally, rather than by each theme's Header —
            Bootstrap's own vanilla-JS event delegation (data-bs-toggle
            etc.) is what makes a theme's offcanvas/dropdown/modal markup
            interactive, and a theme's chrome components are now plain
            server components with no client-side code of their own to
            load it from (see MainLayout.js/resolveThemeChrome.js). */}
        <Script src="/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
