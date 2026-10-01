import { routing } from '../../../i18n/routing';

const LOCALE_LABELS = { fr: 'FR', en: 'EN' };

// Rendered as a small fixed element outside the theme's own Header/Footer
// (which, for an installed theme, is pre-rendered HTML — see
// resolveThemeChrome.js — so there's no slot inside it to hook into
// regardless of which theme is active) rather than depending on every
// theme cooperating with a translation of its own. Links straight to the
// same pathname in each other locale; if no translation exists yet for
// that page, it 404s there — same as linking to any page that doesn't
// exist, nothing special-cased.
export default function LanguageSwitcher({ pathname = '/', locale }) {
  if (routing.locales.length < 2) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '0.5rem',
        right: '0.5rem',
        zIndex: 1200,
        display: 'flex',
        gap: '0.4rem',
        background: 'rgba(255, 255, 255, 0.92)',
        padding: '0.3rem 0.5rem',
        borderRadius: '0.375rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontSize: '0.8rem',
      }}
    >
      {routing.locales.map((loc) => {
        const href = loc === routing.defaultLocale ? pathname : `/${loc}${pathname}`;
        const active = loc === locale;
        return (
          <a
            key={loc}
            href={href}
            aria-current={active ? 'true' : undefined}
            style={{
              color: active ? '#0d6efd' : '#495057',
              fontWeight: active ? 700 : 400,
              textDecoration: 'none',
            }}
          >
            {LOCALE_LABELS[loc] || loc.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
