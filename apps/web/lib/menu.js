import { routing } from '../i18n/routing';

// Only an absolute URL (another site), an anchor, or a protocol link
// (mailto:/tel:) is left untouched — a same-site relative path gets the
// current locale's prefix so the link actually stays on that locale (a
// theme's Header/Footer renders these as plain <a href> tags, pre-
// rendered HTML in most cases — see resolveThemeChrome.js — not Next.js
// <Link>s, so there's no client-side routing magic to rely on here; the
// href itself has to already be correct).
function localizeUrl(url, locale) {
  if (!url || locale === routing.defaultLocale) return url;
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return `/${locale}${path}`;
}

function localizeItem(item, locale) {
  return {
    ...item,
    url: localizeUrl(item.url, locale),
    children: item.children?.map((child) => localizeItem(child, locale)),
  };
}

// Fetches a named navigation menu (managed from /admin/menu) for a theme's
// Header/Footer to render — works from a server component or a client
// one. Each item is { id, label, url, target, order, children: [...] }.
// Locale defaults to the site's default (fr) for any existing caller that
// hasn't been updated to pass one yet (e.g. a theme/plugin's own code).
export async function getMenu(name = 'main', locale = routing.defaultLocale) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/menu/${name}?locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data || []).map((item) => localizeItem(item, locale));
  } catch {
    return [];
  }
}
