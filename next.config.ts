import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatar.iran.liara.run" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ]
  }
};

export default nextConfig;
