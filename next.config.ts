import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Temporary: the old single-tenant URLs point at the medical demo until the
  // marketing site lands at `/`. Removed in the marketing chunk.
  async redirects() {
    return [
      { source: "/", destination: "/demo/medical", permanent: false },
      { source: "/doctors/:slug", destination: "/demo/medical/book/:slug", permanent: false },
      { source: "/booking/:id", destination: "/demo/medical/confirmation/:id", permanent: false },
    ];
  },
};

export default nextConfig;
