function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

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
      url: `${base}/article/${encodeURIComponent(a.slug)}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : a.publishedAt ? new Date(a.publishedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const pageEntries = pages
    .filter((p) => p?.slug)
    .map((p) => ({
      url: `${base}/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [...staticEntries, ...articleEntries, ...pageEntries];
}
