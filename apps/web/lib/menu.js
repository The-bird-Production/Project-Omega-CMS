// Fetches a named navigation menu (managed from /admin/menu) for a theme's
// Header/Footer to render — works from a server component or a client
// one. Each item is { id, label, url, target, order, children: [...] }.
export async function getMenu(name = 'main') {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/menu/${name}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data || [];
  } catch {
    return [];
  }
}
