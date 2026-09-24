import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import Script from 'next/script';
import ClientChrome from './components/layout/ClientChrome';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const t = await getTranslations('Layout');
  const siteName = t('siteName');

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
