'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from './components/theme/themeProvider';


export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {isAdminRoute && <link rel="stylesheet" href="/css/admin.css" />}
      </head>

      <body>
        {isAdminRoute ? (
          <>{children}</>
        ) : (
          <ThemeProvider>{children}</ThemeProvider>
        )}
      </body>
    </html>

  );
}
