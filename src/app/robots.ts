import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

/** During private testing, only the public splash page may be indexed. */
export default function robots(): MetadataRoute.Robots {
  const privateSite = process.env.COMING_SOON === "true" || process.env.SITE_GATE?.toLowerCase() === "locked";
  return {
    rules: privateSite
      ? { userAgent: "*", disallow: "/", allow: process.env.COMING_SOON === "true" ? ["/$", "/coming-soon$"] : [] }
      : { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
  };
}
