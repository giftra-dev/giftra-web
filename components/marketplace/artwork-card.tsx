"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ArtistArtworkWithArtist } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { Heart, Star } from "lucide-react"
import { anonymousArtistName, formatArtworkPrice, getArtworkRating } from "./utils"

export function ArtworkCard({
  artwork,
  isFavorite,
  isLoggedIn,
  onFavorite,
  onRequest,
}: {
  artwork: ArtistArtworkWithArtist
  isFavorite: boolean
  isLoggedIn: boolean
  onFavorite: () => void
  onRequest: () => void
}) {
  const rating = getArtworkRating(artwork)

  return (
    <article className="group overflow-hidden rounded-md border bg-card transition hover:border-primary/40 hover:shadow-sm">
      <div className="relative aspect-square bg-muted">
        <Link href={`/artwork/${artwork.id}`} aria-label={`View ${artwork.title}`}>
          <img src={artwork.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
        </Link>
        <Button
          type="button"
          size="icon"
          variant={isFavorite ? "default" : "secondary"}
          className="absolute right-2 top-2 h-8 w-8"
          onClick={onFavorite}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
        </Button>
        {artwork.is_featured ? (
          <Badge className="absolute left-2 top-2 h-6 rounded-sm px-2 text-[11px]">Featured</Badge>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <Link href={`/category/${artwork.category}`} className="truncate text-muted-foreground hover:text-primary">
            {CATEGORY_LABELS[artwork.category]}
          </Link>
          <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-warning" />
            {rating ? rating.toFixed(1) : "New"}
          </span>
        </div>
        <Link href={`/artwork/${artwork.id}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 hover:text-primary">
            {artwork.title}
          </h3>
        </Link>
        <Link href={`/artists/${artwork.artist_id}`} className="line-clamp-1 block text-xs text-muted-foreground hover:text-primary">
          {anonymousArtistName(artwork.artist_id)}
        </Link>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold">{formatArtworkPrice(artwork)}</p>
            <p className="text-[11px] text-muted-foreground">Custom order</p>
          </div>
          {isLoggedIn ? (
            <Button size="sm" className="h-8 px-2 text-xs" onClick={onRequest}>
              Request
            </Button>
          ) : (
            <Button asChild size="sm" className="h-8 px-2 text-xs">
              <Link href={`/auth/signup?role=customer&next=/artwork/${artwork.id}?request=1`}>
                Request
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
