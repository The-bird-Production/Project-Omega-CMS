import { revalidatePath } from 'next/cache';

// Called by apps/api (see apps/api/Functions/RevalidateWeb.ts) right after a
// page is created/updated/deleted, so the public site reflects the change
// immediately instead of waiting out the 60s ISR window (see
// apps/web/app/[locale]/page.js and apps/web/app/[locale]/[slug]/page.jsx).
// Takes already-locale-prefixed paths (e.g. "/en/contact", "/" for the
// default locale's home) — apps/api builds those itself from a slug +
// locale pair, since it owns the "fr has no prefix" rule (see
// apps/web/i18n/routing.js) rather than duplicating it on both sides.
// REVALIDATE_SECRET is optional here too (see that file for why) — when
// unset, any caller can trigger a revalidation, which only forces a
// re-render and isn't a data leak, so this is a deliberate soft default
// rather than a hard failure.
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ message: 'Secret invalide' }, { status: 401 });
  }

  let paths;
  try {
    ({ paths } = await request.json());
  } catch {
    return Response.json({ message: 'Corps JSON invalide' }, { status: 400 });
  }

  for (const path of Array.isArray(paths) ? paths : [paths]) {
    if (!path) continue;
    revalidatePath(path);
  }

  return Response.json({ revalidated: true });
}
