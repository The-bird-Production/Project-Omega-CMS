// The site's favicon at the well-known /favicon.ico path, which browsers
// request on their own (bookmarks, tabs opened before the page's
// <link rel="icon"> is read, feed readers...): the one uploaded in the
// admin (Thèmes → Favicon, stored by the API — see
// apps/api/Controllers/Favicon/FaviconController.ts), or a neutral default
// when none was uploaded. Replaces Next's file-convention app/favicon.ico,
// which was the create-next-app Vercel logo and showed up instead of the
// site's icon. Lives here and is mapped to /favicon.ico by a rewrite in
// next.config.mjs: a route folder named app/favicon.ico is still taken
// for that file convention and breaks every page.
const DEFAULT_FAVICON = '/default-favicon.svg';

// Short enough that a newly uploaded favicon shows up quickly.
const CACHE_CONTROL = 'public, max-age=300';

async function fetchUploadedFavicon() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;
  try {
    const current = await fetch(`${backendUrl}/favicon/current`, { next: { revalidate: 60 } });
    if (!current.ok) return null;
    const { file } = await current.json();
    if (!file) return null;
    const res = await fetch(`${backendUrl}/favicon/${encodeURIComponent(file)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return { body: await res.arrayBuffer(), type: res.headers.get('content-type') || 'image/x-icon' };
  } catch {
    return null;
  }
}

export async function GET() {
  const uploaded = await fetchUploadedFavicon();
  if (uploaded) {
    return new Response(uploaded.body, {
      headers: { 'Content-Type': uploaded.type, 'Cache-Control': CACHE_CONTROL },
    });
  }
  // Relative Location on purpose: behind a reverse proxy, request.url can
  // carry the internal host rather than the public one.
  return new Response(null, { status: 307, headers: { Location: DEFAULT_FAVICON, 'Cache-Control': CACHE_CONTROL } });
}
