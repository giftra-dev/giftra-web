"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { getArtistPortfolio, getArtistTestimonials, getCurrentUser } from "@/lib/supabase/queries"
import type { ArtistArtwork, ArtworkFeedbackWithRelations, GiftCategory, Profile, Review } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { ArrowLeft, Heart, Star, UserCheck } from "lucide-react"

const favoriteStorageKey = "giftra:favorites"

function anonymousArtistName(artistId: string) {
  return `Giftra Artist ${artistId.slice(0, 4).toUpperCase()}`
}

export default function PublicArtistPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [artist, setArtist] = useState<Profile | null>(null)
  const [artworks, setArtworks] = useState<ArtistArtwork[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [testimonials, setTestimonials] = useState<ArtworkFeedbackWithRelations[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtwork | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [artistRequestOpen, setArtistRequestOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPortfolio() {
      const [portfolio, testimonialData, userData] = await Promise.all([
        getArtistPortfolio(id),
        getArtistTestimonials(id),
        getCurrentUser().catch(() => ({ user: null })),
      ])
      setArtist(portfolio.artist)
      setArtworks(portfolio.artworks)
      setReviews(portfolio.reviews)
      setTestimonials(testimonialData)
      setIsLoggedIn(Boolean(userData.user))
      setFavorites(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]"))
      setIsLoading(false)
    }

    loadPortfolio()
  }, [id])

  const averageReview = useMemo(() => {
    if (reviews.length === 0) return artist?.rating || 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [artist?.rating, reviews])

  const toggleFavorite = (artworkId: string) => {
    setFavorites((current) => {
      const next = current.includes(artworkId)
        ? current.filter((favoriteId) => favoriteId !== artworkId)
        : [...current, artworkId]
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next))
      return next
    })
  }

  const startRequest = (artwork: ArtistArtwork) => {
    setSelectedArtwork(artwork)
    if (isLoggedIn) {
      setRequestOpen(true)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-52 rounded bg-muted" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 rounded bg-muted" />
            <div className="h-80 rounded bg-muted" />
            <div className="h-80 rounded bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!artist) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-3xl rounded-lg border p-8 text-center">
          <p className="font-medium">Artist portfolio not found</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/browse">Back to Browse</Link>
          </Button>
        </div>
      </main>
    )
  }

  const artistName = anonymousArtistName(artist.id)

  return (
    <main className="min-h-screen bg-background">
      <MarketplaceHeader wishlistCount={favorites.length} />

      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
            <Link href="/#artworks">
              <ArrowLeft className="h-4 w-4" />
              Browse Gifts
            </Link>
          </Button>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserCheck className="h-9 w-9 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{artistName}</h1>
                {artist.is_available && <Badge variant="outline">Available for requests</Badge>}
              </div>
              <p className="mt-2 max-w-3xl text-muted-foreground">{artist.bio || "This artist has not added a public bio yet."}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {averageReview > 0 ? averageReview.toFixed(1) : "New"} rating
                </span>
                <span>{reviews.length || artist.total_reviews} reviews</span>
                <span>{artworks.length} portfolio pieces</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(artist.specialties || []).map((specialty) => (
                  <Badge key={specialty} variant="secondary">{CATEGORY_LABELS[specialty]}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sample Work</h2>
          {isLoggedIn ? (
            <Button onClick={() => artworks[0] ? startRequest(artworks[0]) : setArtistRequestOpen(true)}>
              Request This Artist
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/customer/signup?next=/browse">Request This Artist</Link>
            </Button>
          )}
        </div>
        {artworks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            This artist has not published sample work yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => {
              const isFavorite = favorites.includes(artwork.id)
              return (
                <Card key={artwork.id} className="overflow-hidden rounded-lg shadow-sm">
                  <div className="relative aspect-[4/5] bg-muted">
                    <img src={artwork.image_url} alt="" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant={isFavorite ? "default" : "secondary"}
                      className="absolute right-3 top-3 rounded-full shadow-sm"
                      onClick={() => toggleFavorite(artwork.id)}
                    >
                      <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                    </Button>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <Badge variant="outline">{CATEGORY_LABELS[artwork.category]}</Badge>
                    <div>
                      <h3 className="font-semibold">{artwork.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{artwork.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      {(artwork.price_min || artwork.price_max) && (
                        <span className="text-sm font-medium">
                          ${artwork.price_min || artwork.price_max}
                          {artwork.price_max && artwork.price_max !== artwork.price_min ? ` - $${artwork.price_max}` : ""}
                        </span>
                      )}
                      {isLoggedIn ? (
                        <Button size="sm" onClick={() => startRequest(artwork)}>Request Similar</Button>
                      ) : (
                        <Button asChild size="sm">
                          <Link href="/auth/customer/signup?next=/browse">Request Similar</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-12">
        <h2 className="mb-4 text-xl font-semibold">Selected Testimonials</h2>
        {testimonials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 8).map((testimonial) => (
              <div key={testimonial.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-current text-warning" />
                  <span className="font-medium">{testimonial.rating}/5</span>
                  {testimonial.title && <span>{testimonial.title}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.content || "Rated this artwork."}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {testimonial.customer?.full_name || "Giftra customer"}
                  {testimonial.artwork?.title ? ` on ${testimonial.artwork.title}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">No public feedback yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-medium">{review.rating}/5</span>
                  {review.title && <span>{review.title}</span>}
                </div>
                {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedArtwork && (
        <CreateRequestDialog
          key={selectedArtwork.id}
          open={requestOpen}
          onOpenChange={setRequestOpen}
          initialTitle={`Custom gift inspired by ${selectedArtwork.title}`}
          initialDescription={`I like this style: ${selectedArtwork.title}. ${selectedArtwork.description || ""}`.trim()}
          initialCategory={selectedArtwork.category as GiftCategory}
          initialBudgetMin={selectedArtwork.price_min || undefined}
          initialBudgetMax={selectedArtwork.price_max || selectedArtwork.price_min || undefined}
          inspirationArtworkId={selectedArtwork.id}
        />
      )}

      {artist && (
        <CreateRequestDialog
          open={artistRequestOpen}
          onOpenChange={setArtistRequestOpen}
          initialTitle={`Custom gift by ${artistName}`}
          initialDescription={`I would like to discuss a custom gift with ${artistName}.`}
          initialCategory={(artist.specialties?.[0] || "portrait") as GiftCategory}
          assignedArtistId={artist.id}
        />
      )}
    </main>
  )
}
