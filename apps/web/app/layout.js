import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import Script from 'next/script';
import ClientChrome from './components/layout/ClientChrome';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Falls back to Next's own file-convention favicon (app/favicon.ico) when
// nothing's been uploaded yet — omitting `icons` from the returned
// metadata entirely (rather than pointing it at a hardcoded default url)
// is what leaves that convention in effect.
async function getFaviconUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;
  try {
    const res = await fetch(`${backendUrl}/favicon/current`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const t = await getTranslations('Layout');
  const siteName = t('siteName');
  const faviconUrl = await getFaviconUrl();

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
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
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
