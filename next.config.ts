import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import path from "node:path";

export default function nextConfig(phase: string): NextConfig {
  // npm run dev owns this loopback server. No preview routes or toolbar module
  // are included in build/start, even if this environment variable is present.
  const previewPort = Number(process.env.DEV_PREVIEW_PORT);
  const development = phase === PHASE_DEVELOPMENT_SERVER
    && Number.isInteger(previewPort) && previewPort > 0 && previewPort <= 65535;
  const toolbar = development
    ? "./dev/mount.tsx"
    : "./src/components/development-tools.disabled.tsx";

  return {
    outputFileTracingIncludes: { "/api/jobs": ["./public/marketing/happy-pillow-mascot.png"] },
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "**.supabase.co" },
      ],
    },
    turbopack: { resolveAlias: { "@development-tools": toolbar } },
    webpack(config) {
      config.resolve.alias["@development-tools"] = path.resolve(__dirname, toolbar);
      return config;
    },
    ...(development ? {
      rewrites: async () => [{
        source: "/__dev/:path*",
        destination: `http://127.0.0.1:${previewPort}/:path*`,
      }],
    } : {}),
  };
}
