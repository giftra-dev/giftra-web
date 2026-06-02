import type { ArtistArtworkWithArtist } from "@/lib/types/database"

export const favoriteStorageKey = "giftra:favorites"

export function anonymousArtistName(artistId: string) {
  return `Artist ${artistId.slice(-4).toUpperCase()}`
}

export function formatArtworkPrice(artwork: ArtistArtworkWithArtist) {
  if (!artwork.price_min && !artwork.price_max) return "Quote"
  if (artwork.price_min && artwork.price_max && artwork.price_min !== artwork.price_max) {
    return `$${artwork.price_min} - $${artwork.price_max}`
  }
  return `$${artwork.price_min || artwork.price_max}`
}

export function getArtworkRating(artwork: ArtistArtworkWithArtist) {
  return artwork.artist?.rating || 0
}

export function readWishlist() {
  if (typeof window === "undefined") return []

  try {
    const value = JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]")
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

export function writeWishlist(ids: string[]) {
  localStorage.setItem(favoriteStorageKey, JSON.stringify(ids))
}
