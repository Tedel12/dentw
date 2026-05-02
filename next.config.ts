import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // On active même en dev pour tester si besoin, ou on laisse process.env.NODE_ENV === "development"
});

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

export default withPWA(nextConfig);
