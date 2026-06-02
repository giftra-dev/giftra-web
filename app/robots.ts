import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/artist", "/customer", "/chat"],
    },
    sitemap: "https://www.giftra.co.in/sitemap.xml",
  }
}
