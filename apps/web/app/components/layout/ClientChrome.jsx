'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../theme/themeProvider';

export default function ClientChrome({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {isAdminRoute && <link rel="stylesheet" href="/css/admin.css" />}
      {isAdminRoute ? (
        <>{children}</>
      ) : (
        <ThemeProvider>{children}</ThemeProvider>
      )}
    </>
  );
}
