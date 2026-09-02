import type { MetadataRoute } from "next";

/** Crawlers may index the product site; the dashboard and APIs are off-limits. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
  };
}
