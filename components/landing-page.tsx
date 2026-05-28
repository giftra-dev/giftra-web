"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { getCurrentUser, getPublicArtworks } from "@/lib/supabase/queries"
import type { ArtistArtworkWithArtist, GiftCategory } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { ArrowRight, CreditCard, Gift, Heart, MessageSquareText, Palette, Search, Shield, Sparkles, Star } from "lucide-react"

function sampleUuid(kind: "artwork" | "artist", index: number) {
  const namespace = kind === "artist" ? "4001" : "4002"
  return `00000000-0000-${namespace}-8000-${String(index + 1).padStart(12, "0")}`
}

const fallbackArtworks: ArtistArtworkWithArtist[] = Array.from({ length: 12 }, (_, index) => {
  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>
  const category = categories[index % categories.length]
  const artistId = sampleUuid("artist", index)
  return {
    id: sampleUuid("artwork", index),
    artist_id: artistId,
    title: [
      "Heirloom Family Portrait",
      "Botanical Jewelry Keepsake",
      "Pet Memory Illustration",
      "Ceramic Wedding Vessel",
      "Storybook Couple Caricature",
      "Custom Calligraphy Vows",
      "Handwoven Baby Blanket",
      "Wooden Anniversary Box",
      "Digital Home Portrait",
      "Playful Birthday Sculpture",
      "Minimal Name Pendant",
      "Holiday Memory Ornament",
    ][index],
    description: "Sample custom gift inspiration for made-to-order requests.",
    category,
    image_url: `https://picsum.photos/seed/giftra-home-${index + 1}/900/900`,
    price_min: 65 + index * 8,
    price_max: 140 + index * 16,
    tags: [],
    is_featured: index < 5,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    artist: {
      id: artistId,
      avatar_url: null,
      bio: null,
      specialties: [category],
      rating: 4.4 + (index % 5) / 10,
      total_reviews: 10 + index,
      is_available: true,
    },
  }
})

const favoriteStorageKey = "giftra:favorites"

function anonymousArtistName(artistId: string) {
  return `Giftra Artist ${artistId.slice(-4).toUpperCase()}`
}

export function LandingPage() {
  const [artworks, setArtworks] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function loadArtworks() {
      try {
        const [data, currentUser] = await Promise.all([
          getPublicArtworks(),
          getCurrentUser().catch(() => ({ user: null })),
        ])
        setArtworks(data.length > 0 ? data : fallbackArtworks)
        setIsLoggedIn(Boolean(currentUser.user))
      } catch {
        setArtworks(fallbackArtworks)
      }
    }

    loadArtworks()
    setFavorites(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]"))
  }, [])

  const featured = artworks.filter((artwork) => artwork.is_featured).slice(0, 8)
  const carouselItems = featured.length > 0 ? featured : artworks.slice(0, 8)

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const text = [artwork.title, artwork.description, artwork.category, ...(artwork.tags || [])]
        .join(" ")
        .toLowerCase()
      return (
        text.includes(search.toLowerCase()) &&
        (category === "all" || artwork.category === category)
      )
    })
  }, [artworks, category, search])

  const toggleFavorite = (artworkId: string) => {
    setFavorites((current) => {
      const next = current.includes(artworkId)
        ? current.filter((id) => id !== artworkId)
        : [...current, artworkId]
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next))
      return next
    })
  }

  const startRequest = (artwork: ArtistArtworkWithArtist) => {
    setSelectedArtwork(artwork)
    if (isLoggedIn) {
      setRequestOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Giftra</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#artworks" className="text-sm text-muted-foreground hover:text-foreground">Artworks</Link>
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse All</Link>
            <Link href="/auth/signup?role=artist" className="text-sm text-muted-foreground hover:text-foreground">Sell on Giftra</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/browse">Browse Gifts</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 lg:py-10">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Custom gifts from curated artists
              </div>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Browse inspiration first. Request the perfect custom gift when it clicks.
              </h1>
              <p className="mt-3 text-muted-foreground">
                Explore portfolio samples, compare anonymous artists, favorite ideas, and raise a request from any artwork.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="lg">
                <Link href="/browse">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/signup?role=artist">Join as Artist</Link>
              </Button>
            </div>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="mx-auto">
            <CarouselContent>
              {carouselItems.map((artwork) => (
                <CarouselItem key={artwork.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="aspect-[4/3] bg-muted">
                      <img src={artwork.image_url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{CATEGORY_LABELS[artwork.category]}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {artwork.artist?.rating ? artwork.artist.rating.toFixed(1) : "New"}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold">{artwork.title}</h2>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{artwork.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary">{anonymousArtistName(artwork.artist_id)}</span>
                        <Button asChild size="sm">
                          <Link href={`/artists/${artwork.artist_id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      <section className="border-b bg-card py-5">
        <div className="container mx-auto grid gap-3 px-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm">Anonymous artist previews until request flow</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm">Protected payment and order workflow</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <span className="text-sm">Chat unlocks after confirmed order</span>
          </div>
        </div>
      </section>

      <section id="artworks" className="container mx-auto px-4 py-8">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Shop Custom Gift Inspiration</h2>
            <p className="text-sm text-muted-foreground">Favorite ideas now, request custom work when ready.</p>
          </div>
          <div className="grid gap-2 md:grid-cols-[260px_190px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gifts..."
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredArtworks.map((artwork) => {
            const isFavorite = favorites.includes(artwork.id)
            return (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <img src={artwork.image_url} alt="" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant={isFavorite ? "default" : "secondary"}
                    className="absolute right-3 top-3"
                    onClick={() => toggleFavorite(artwork.id)}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                  </Button>
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{CATEGORY_LABELS[artwork.category]}</Badge>
                    {(artwork.price_min || artwork.price_max) && (
                      <span className="text-sm font-medium">
                        ${artwork.price_min || artwork.price_max}
                        {artwork.price_max && artwork.price_max !== artwork.price_min ? ` - $${artwork.price_max}` : ""}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{artwork.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{artwork.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/artists/${artwork.artist_id}`} className="text-primary hover:underline">
                      {anonymousArtistName(artwork.artist_id)}
                    </Link>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {artwork.artist?.rating ? artwork.artist.rating.toFixed(1) : "New"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {isLoggedIn ? (
                      <Button className="flex-1" onClick={() => startRequest(artwork)}>
                        Request Similar
                      </Button>
                    ) : (
                      <Button asChild className="flex-1" onClick={() => setSelectedArtwork(artwork)}>
                        <Link href="/auth/signup?role=customer&next=/">
                          Request Similar
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline">
                      <Link href={`/artists/${artwork.artist_id}`}>Portfolio</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Palette className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No matching artwork yet</p>
            <p className="text-sm text-muted-foreground">Try a different category or search term.</p>
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
          preferredArtistId={selectedArtwork.artist_id}
          inspirationArtworkId={selectedArtwork.id}
        />
      )}
    </div>
  )
}
