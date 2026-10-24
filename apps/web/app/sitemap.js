function siteUrl() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  // A typo here ("htts://...") silently produced a sitemap search engines
  // can't use at all — say so in the logs.
  if (base && !/^https?:\/\/[^/]+/.test(base)) {
    console.warn(`NEXT_PUBLIC_SITE_URL ne ressemble pas à une adresse web valide : "${base}" (attendu : https://votre-site.fr).`);
  }
  return base;
}

// The default locale (fr) keeps unprefixed URLs (see i18n/routing.js).
const localePrefix = (locale) => (locale && locale !== "fr" ? `/${locale}` : "");

async function fetchArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/get/all`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

async function fetchPages() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/all`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const base = siteUrl();
  if (!base) return [];

  const [articles, pages] = await Promise.all([fetchArticles(), fetchPages()]);

  const staticEntries = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/article`, changeFrequency: "daily", priority: 0.8 },
  ];

  const articleEntries = articles
    .filter((a) => a?.slug)
    .map((a) => ({
      url: `${base}${localePrefix(a.locale)}/article/${encodeURIComponent(a.slug)}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : a.publishedAt ? new Date(a.publishedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // The "home" page is the site's root (see app/[locale]/page.js), already
  // listed above for French — listing /home too gave search engines a
  // duplicate of the home page at an address that isn't the real one.
  const pageEntries = pages
    .filter((p) => p?.slug && !(p.slug === "home" && localePrefix(p.locale) === ""))
    .map((p) => ({
      url:
        p.slug === "home"
          ? `${base}${localePrefix(p.locale)}/`
          : `${base}${localePrefix(p.locale)}/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: p.slug === "home" ? 1 : 0.5,
    }));

  return [...staticEntries, ...articleEntries, ...pageEntries];
}
