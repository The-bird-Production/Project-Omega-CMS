'use client';

import { usePathname } from 'next/navigation';
import OffcanvasScrollFix from './OffcanvasScrollFix';

// Theme Header/Footer are resolved server-side now (see
// MainLayout.js/resolveThemeChrome.js) — this only decides admin vs.
// public chrome (CSS, and generic Bootstrap offcanvas cleanup that only
// public theme navs use).
export default function ClientChrome({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {isAdminRoute && (
        <>
          <link rel="stylesheet" href="/css/admin.css" />
          <link rel="stylesheet" href="/css/admin-design-system.css" />
        </>
      )}
      {!isAdminRoute && <OffcanvasScrollFix />}
      {children}
    </>
  );
}
