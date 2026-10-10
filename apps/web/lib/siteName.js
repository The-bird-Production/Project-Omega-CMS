import { getTranslations } from 'next-intl/server';

// The site's public name, set in the admin (Thèmes → Nom du site, stored
// by the API — see apps/api/Controllers/System/SiteController.ts) and
// shown after every page title in the browser tab. Falls back to the
// translated default ("Omega CMS") when none is set or the API can't be
// reached. Cached like the rest of the site's API reads, so a change
// shows up within a minute.
export async function getSiteName() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/system/site`, { next: { revalidate: 60 } });
      if (res.ok) {
        const data = await res.json();
        if (data?.siteName) return data.siteName;
      }
    } catch {
      // API unreachable: use the default below.
    }
  }
  const t = await getTranslations('Layout');
  return t('siteName');
}
