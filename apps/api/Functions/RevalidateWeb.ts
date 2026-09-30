// Public pages are served by apps/web with ISR (revalidate = 60s, see
// apps/web/app/page.js and apps/web/app/[slug]/page.jsx) — without this,
// an admin's edit wouldn't show up on the public site for up to a minute,
// which is exactly the "je mets à jour une page, ça ne s'affiche pas
// directement" complaint this closes. Both WEB_URL and REVALIDATE_SECRET
// are optional: if WEB_URL isn't set, this silently no-ops so an existing
// deployment that hasn't configured it yet just keeps the old 60s-window
// behavior instead of failing the save itself.
export async function revalidateWebPaths(slugs: Array<string | null | undefined>): Promise<void> {
  const webUrl = process.env.WEB_URL;
  if (!webUrl) return;

  const validSlugs = [...new Set(slugs.filter((s): s is string => Boolean(s)))];
  if (validSlugs.length === 0) return;

  const secret = process.env.REVALIDATE_SECRET;
  try {
    await fetch(`${webUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-revalidate-secret": secret } : {}),
      },
      body: JSON.stringify({ slugs: validSlugs }),
    });
  } catch (err) {
    console.error("Échec de la revalidation de la page publique :", err);
  }
}
