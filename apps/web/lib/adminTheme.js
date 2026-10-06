// Admin day/night preference — persisted per browser and applied as
// data-bs-theme on <html> (admin.css's own dark rules and the tokens in
// admin-design-system.css key off that attribute). Only ever set while the
// admin shell is mounted, so the public site is never affected.
const KEY = 'omega-admin-theme';

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {}
  return 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
}

export function clearTheme() {
  document.documentElement.removeAttribute('data-bs-theme');
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  applyTheme(theme);
}
