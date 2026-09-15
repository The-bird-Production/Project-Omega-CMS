'use client';

// Discovers block contributions from installed plugins and the active
// theme for use in the (browser-side) admin editor. A plugin/theme
// contributes blocks by shipping a `blocks.js` that default-exports an
// object of { blockType: BlockSpec }, built with createReactBlockSpec —
// see apps/web/lib/blocks/README.md for the contract. One that doesn't
// ship one simply fails to import and is silently skipped.

async function fetchJson(path) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
      credentials: 'include',
      mode: 'cors',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function discoverClientBlockSpecs() {
  const specs = {};

  const plugins = await fetchJson('/plugins');
  if (Array.isArray(plugins)) {
    for (const plugin of plugins) {
      try {
        const mod = await import(`../../app/components/plugin/${plugin.id}/blocks.js`);
        Object.assign(specs, mod.default ?? mod);
      } catch {
        // No blocks.js shipped by this plugin.
      }
    }
  }

  let theme = await fetchJson('/themes/current');
  if (!theme) theme = await fetchJson('/themes/default');
  if (theme?.id) {
    try {
      const mod = await import(`../../app/Themes/${theme.id}/components/blocks.js`);
      Object.assign(specs, mod.default ?? mod);
    } catch {
      // Theme doesn't contribute blocks.
    }
  }

  return specs;
}
