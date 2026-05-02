import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: "://unsplash.com" },
      { protocol: "https", hostname: "avatar.iran.liara.run" },
      { protocol: "https", hostname: "://clerk.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ]
  }
};

export default nextConfig;
