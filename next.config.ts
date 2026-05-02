import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /_next\/static\/.*\.map$/,
    /react-loadable-manifest\.json$/,
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
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
