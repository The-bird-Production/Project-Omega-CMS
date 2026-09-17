'use client';

async function fetchJson(path) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Lists the page templates the active theme declares in its theme.json
// (config.pageTemplates: [{ name, label }]) — used by the Page admin
// editor's template picker. See apps/web/lib/pageTemplates/README.md.
export async function listPageTemplates() {
  let theme = await fetchJson('/themes/current');
  if (!theme) theme = await fetchJson('/themes/default');
  return theme?.config?.pageTemplates ?? [];
}
