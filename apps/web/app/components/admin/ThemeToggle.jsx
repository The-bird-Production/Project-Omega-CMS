'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getStoredTheme, setStoredTheme } from '../../../lib/adminTheme';

// Day/night switch for the admin panel (see lib/adminTheme.js).
export default function ThemeToggle() {
  const t = useTranslations('Admin');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
  };

  const label = theme === 'dark' ? t('themeToDay') : t('themeToNight');

  return (
    <button type="button" className="admin-theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
    </button>
  );
}
