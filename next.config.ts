import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js image optimization so local/public SVG/PNG render reliably
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'collexaedu.s3.us-east-1.wasabisys.com',
        pathname: '/uploads/**',
      },
      // Add other domains here if you load remote images later
    ],
  },
};

export default nextConfig;
