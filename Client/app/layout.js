import SessionWrapper from './components/auth/SessionWrapper';
import { ThemeProvider } from './components/theme/themeProvider';

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <SessionWrapper>
        <html lang="en">
          <head>
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
            ></link>
          </head>

          <body>{children}</body>
        </html>
      </SessionWrapper>
    </ThemeProvider>
  );
}
