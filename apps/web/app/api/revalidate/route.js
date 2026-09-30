import { revalidatePath } from 'next/cache';

// Called by apps/api (see apps/api/Functions/RevalidateWeb.ts) right after a
// page is created/updated/deleted, so the public site reflects the change
// immediately instead of waiting out the 60s ISR window (see
// apps/web/app/page.js and apps/web/app/[slug]/page.jsx). REVALIDATE_SECRET
// is optional here too (see that file for why) — when unset, any caller can
// trigger a revalidation, which only forces a re-render and isn't a data
// leak, so this is a deliberate soft default rather than a hard failure.
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ message: 'Secret invalide' }, { status: 401 });
  }

  let slugs;
  try {
    ({ slugs } = await request.json());
  } catch {
    return Response.json({ message: 'Corps JSON invalide' }, { status: 400 });
  }

  for (const slug of Array.isArray(slugs) ? slugs : [slugs]) {
    if (!slug) continue;
    revalidatePath(slug === 'home' ? '/' : `/${slug}`);
  }

  return Response.json({ revalidated: true });
}
