/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin:"anonymous",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      {protocol: "http", hostname: "localhost:3001"}, 
    ],
  },
};

export default nextConfig;
