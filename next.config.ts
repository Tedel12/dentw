import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  typescript: {
    // Ignore les erreurs de types au build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore les erreurs de linting (ESLint) au build
    ignoreDuringBuilds: true,
  },

  /* Remplacement de experimental.turbo par turbopack */
  turbopack: {
    resolveAlias: {
      // Ton alias si nécessaire
    },
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
