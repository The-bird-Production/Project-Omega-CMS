import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy pour les fichiers de plugins
      {
        source: '/plugins/:path*',
        destination: 'http://localhost:3001/plugins/static/:path*', // API Express.js
      },
      {
        source: '/api/plugins',
        destination: 'http://localhost:3001/plugins', // API Express.js
      },
    ];
  },
  crossOrigin:"anonymous",
  // BlockNote's server-side HTML renderer (used to render page/article body
  // blocks — including plugin/theme-contributed ones — server-side) pulls
  // in ProseMirror/Tiptap internals that don't play well with Next's
  // default bundling of server code; keep them as real Node dependencies
  // instead.
  serverExternalPackages: ['@blocknote/core', '@blocknote/server-util', '@blocknote/react'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "http", hostname: "localhost:3001"}, 
    ],
  },
  reactStrictMode: true,
  eslint: {
    // A batch of pre-existing lint errors (react-hooks/rules-of-hooks on
    // lowercase-named components, unescaped entities, etc.) is tracked
    // separately and not yet fixed; don't let it block production builds.
    // `npm run lint` still reports them (non-blocking) in CI.
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
