import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  /* config options here */
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ]
  }
};

export default nextConfig;
