import SessionWrapper from "./components/auth/SessionWrapper";

export default function RootLayout({ children }) {
  return (
    <SessionWrapper>
      <html lang="en">
        <head></head>

        <body>{children}</body>
      </html>
    </SessionWrapper>
  );
}
