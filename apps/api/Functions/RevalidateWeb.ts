// Public pages are served by apps/web with ISR (revalidate = 60s, see
// apps/web/app/[locale]/page.js and apps/web/app/[locale]/[slug]/page.jsx)
// — without this, an admin's edit wouldn't show up on the public site for
// up to a minute, which is exactly the "je mets à jour une page, ça ne
// s'affiche pas directement" complaint this closes. Both WEB_URL and
// REVALIDATE_SECRET are optional: if WEB_URL isn't set, this silently
// no-ops so an existing deployment that hasn't configured them yet just
// keeps the old 60s-window behavior instead of failing the save itself.
type LocalizedSlug = { slug: string | null | undefined; locale: string | null | undefined };

export async function revalidateWebPaths(entries: Array<LocalizedSlug | null | undefined>): Promise<void> {
  const webUrl = process.env.WEB_URL;
  if (!webUrl) return;

  const paths = [
    ...new Set(
      entries
        .filter((e): e is LocalizedSlug => Boolean(e?.slug))
        .map((e) => {
          const locale = e.locale || "fr";
          const slug = e.slug as string;
          // The default locale (fr) keeps unprefixed URLs (see
          // apps/web/i18n/routing.js) — only a non-default locale needs
          // its prefix here too.
          const localePrefix = locale === "fr" ? "" : `/${locale}`;
          return slug === "home" ? `${localePrefix}/` : `${localePrefix}/${slug}`;
        })
    ),
  ];
  if (paths.length === 0) return;

  const secret = process.env.REVALIDATE_SECRET;
  try {
    await fetch(`${webUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-revalidate-secret": secret } : {}),
      },
      body: JSON.stringify({ paths }),
    });
  } catch (err) {
    console.error("Échec de la revalidation de la page publique :", err);
  }
}
