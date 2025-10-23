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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "http", hostname: "localhost:3001"}, 
    ],
  },
  reactStrictMode: true,
  
};

export default nextConfig;
