import { getSiteName } from './siteName';

// generateMetadata for an admin section's layout.js: the full tab title,
// "<section> · Administration · <site name>". Built absolute rather than
// through app/admin/layout.js's title template, which Next.js doesn't
// carry down past a nested layout that sets its own title (a sub-page
// like Articles → Nouvel article lost the suffix).
export function adminMetadata(title) {
  return async function generateMetadata() {
    return { title: { absolute: `${title} · Administration · ${await getSiteName()}` } };
  };
}
