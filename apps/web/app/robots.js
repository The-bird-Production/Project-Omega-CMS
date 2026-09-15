export default function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
