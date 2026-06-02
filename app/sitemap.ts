import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.giftra.co.in"

  return [
    "",
    "/browse",
    "/wishlist",
    "/privacy",
    "/terms",
    "/category/portrait",
    "/category/caricature",
    "/category/illustration",
    "/category/calligraphy",
    "/category/custom_jewelry",
    "/category/woodwork",
    "/category/pottery",
    "/category/textile",
    "/category/digital_art",
    "/category/other",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/category") ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/category") ? 0.8 : 0.6,
  }))
}
