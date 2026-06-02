"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gift,
  Heart,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Truck,
  UserRound,
} from "lucide-react"

type SortOption = "featured" | "newest" | "price_low" | "price_high" | "rating"
type PriceFilter = "all" | "under100" | "100to250" | "250plus"
type RatingFilter = "all" | "4plus" | "45plus"

function sampleUuid(kind: "artwork" | "artist", index: number) {
  const namespace = kind === "artist" ? "4001" : "4002"
  return `00000000-0000-${namespace}-8000-${String(index + 1).padStart(12, "0")}`
}

const fallbackArtworks: ArtistArtworkWithArtist[] = Array.from({ length: 24 }, (_, index) => {
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
    ][index % 12],
    description: "Custom gift sample for made-to-order inspiration.",
    category,
    image_url: `https://picsum.photos/seed/giftra-home-${index + 1}/700/700`,
    price_min: 45 + index * 5,
    price_max: 95 + index * 11,
    tags: ["custom", "gift", category.replace("_", " ")],
    is_featured: index < 10,
    is_public: true,
    created_at: new Date(Date.now() - index * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    artist: {
      id: artistId,
      avatar_url: null,
      bio: null,
      specialties: [category],
      rating: 4.2 + (index % 7) / 10,
      total_reviews: 8 + index,
      is_available: true,
    },
  }
})

const favoriteStorageKey = "giftra:favorites"
const categoryEntries = Object.entries(CATEGORY_LABELS) as Array<[GiftCategory, string]>

function anonymousArtistName(artistId: string) {
  return `Artist ${artistId.slice(-4).toUpperCase()}`
}

function formatPrice(artwork: ArtistArtworkWithArtist) {
  if (!artwork.price_min && !artwork.price_max) return "Quote"
  if (artwork.price_min && artwork.price_max && artwork.price_min !== artwork.price_max) {
    return `$${artwork.price_min} - $${artwork.price_max}`
  }
  return `$${artwork.price_min || artwork.price_max}`
}

function getComparablePrice(artwork: ArtistArtworkWithArtist) {
  return artwork.price_min || artwork.price_max || 0
}

function getRating(artwork: ArtistArtworkWithArtist) {
  return artwork.artist?.rating || 0
}

function MarketplaceTile({
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
  const rating = getRating(artwork)

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
            <p className="text-base font-bold">{formatPrice(artwork)}</p>
            <p className="text-[11px] text-muted-foreground">Custom order</p>
          </div>
          {isLoggedIn ? (
            <Button size="sm" className="h-8 px-2 text-xs" onClick={onRequest}>
              Request
            </Button>
          ) : (
            <Button asChild size="sm" className="h-8 px-2 text-xs">
              <Link href={`/auth/signup?role=customer&next=/artwork/${artwork.id}?request=1`}>Request</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export function LandingPage() {
  const [artworks, setArtworks] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<GiftCategory | "all">("all")
  const [sort, setSort] = useState<SortOption>("featured")
  const [price, setPrice] = useState<PriceFilter>("all")
  const [rating, setRating] = useState<RatingFilter>("all")
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      } finally {
        setIsLoading(false)
      }
    }

    loadArtworks()
    setFavorites(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]"))
  }, [])

  const categoryCounts = useMemo(() => {
    return artworks.reduce<Record<string, number>>((counts, artwork) => {
      counts[artwork.category] = (counts[artwork.category] || 0) + 1
      return counts
    }, {})
  }, [artworks])

  const featured = useMemo(() => {
    const items = artworks.filter((artwork) => artwork.is_featured)
    return (items.length > 0 ? items : artworks).slice(0, 10)
  }, [artworks])

  const topRated = useMemo(() => {
    return [...artworks].sort((a, b) => getRating(b) - getRating(a)).slice(0, 6)
  }, [artworks])

  const filteredArtworks = useMemo(() => {
    const filtered = artworks.filter((artwork) => {
      const text = [
        artwork.title,
        artwork.description,
        artwork.category,
        anonymousArtistName(artwork.artist_id),
        ...(artwork.tags || []),
      ].join(" ").toLowerCase()
      const maxPrice = artwork.price_max || artwork.price_min || 0
      const itemRating = getRating(artwork)

      const matchesSearch = text.includes(search.toLowerCase())
      const matchesCategory = category === "all" || artwork.category === category
      const matchesPrice =
        price === "all" ||
        (price === "under100" && maxPrice <= 100) ||
        (price === "100to250" && maxPrice > 100 && maxPrice <= 250) ||
        (price === "250plus" && maxPrice > 250)
      const matchesRating =
        rating === "all" ||
        (rating === "4plus" && itemRating >= 4) ||
        (rating === "45plus" && itemRating >= 4.5)

      return matchesSearch && matchesCategory && matchesPrice && matchesRating
    })

    return filtered.sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === "price_low") return getComparablePrice(a) - getComparablePrice(b)
      if (sort === "price_high") return getComparablePrice(b) - getComparablePrice(a)
      if (sort === "rating") return getRating(b) - getRating(a)
      return Number(b.is_featured) - Number(a.is_featured) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [artworks, category, price, rating, search, sort])

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

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setPrice("all")
    setRating("all")
    setSort("featured")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Gift className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Giftra</span>
            </Link>
            <Button asChild variant="outline" size="sm" className="lg:hidden">
              <Link href="/wishlist">
                <Menu className="mr-2 h-4 w-4" />
                Browse
              </Link>
            </Button>
          </div>

          <div className="flex flex-1 gap-2">
            <Select value={category} onValueChange={(value) => setCategory(value as GiftCategory | "all")}>
              <SelectTrigger className="hidden w-44 rounded-md lg:flex">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryEntries.map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search custom portraits, jewelry, woodwork, digital art..."
                className="h-10 rounded-md pl-10"
              />
            </div>
            <Button asChild className="hidden h-10 px-4 md:inline-flex">
              <Link href="#artworks">Search</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/signup?role=artist">
                <Store className="mr-2 h-4 w-4" />
                Sell
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">
                <UserRound className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/browse">
                <Heart className="mr-2 h-4 w-4" />
                {favorites.length}
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t bg-background">
          <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-2">
            <Button
              type="button"
              size="sm"
              variant={category === "all" ? "default" : "ghost"}
              className="h-8 shrink-0"
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {categoryEntries.map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={category === value ? "default" : "ghost"}
                className="h-8 shrink-0"
                onClick={() => setCategory(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b bg-background">
          <div className="container mx-auto grid gap-4 px-4 py-4 lg:grid-cols-[220px_1fr_260px]">
            <aside className="hidden rounded-md border bg-card p-3 lg:block">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" />
                Shop by Category
              </div>
              <div className="space-y-1">
                {categoryEntries.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">{categoryCounts[value] || 0}</span>
                  </button>
                ))}
              </div>
            </aside>

            <Carousel opts={{ align: "start", loop: true }} className="min-w-0">
              <CarouselContent>
                {featured.slice(0, 6).map((artwork) => (
                  <CarouselItem key={artwork.id}>
                    <div className="grid min-h-[300px] overflow-hidden rounded-md border bg-card md:grid-cols-[1.1fr_0.9fr]">
                      <div className="flex flex-col justify-between gap-4 p-6">
                        <div>
                          <Badge className="mb-3 rounded-sm">Featured custom gift</Badge>
                          <h1 className="max-w-xl text-3xl font-bold leading-tight md:text-4xl">
                            Handmade gifts ready to customize
                          </h1>
                          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                            Browse artist samples, compare styles, save favorites, and raise a custom request only when you are ready.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild>
                            <Link href="#artworks">
                              Shop listings
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href={`/artists/${artwork.artist_id}`}>View featured artist</Link>
                          </Button>
                        </div>
                      </div>
                      <div className="relative min-h-[220px] bg-muted">
                        <img src={artwork.image_url} alt="" className="h-full w-full object-cover" />
                        <div className="absolute bottom-3 left-3 right-3 rounded-md bg-background/95 p-3 shadow-sm">
                          <p className="line-clamp-1 text-sm font-semibold">{artwork.title}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(artwork)} - {CATEGORY_LABELS[artwork.category]}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>

            <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-md border bg-card p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Protected ordering</p>
                <p className="mt-1 text-xs text-muted-foreground">Payment and chat unlock after approved workflow.</p>
              </div>
              <div className="rounded-md border bg-card p-4">
                <BadgeCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Anonymous browsing</p>
                <p className="mt-1 text-xs text-muted-foreground">Explore artists without logging in first.</p>
              </div>
              <div className="rounded-md border bg-card p-4">
                <Truck className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Made to order</p>
                <p className="mt-1 text-xs text-muted-foreground">Every listing becomes a custom request.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b bg-card">
          <div className="container mx-auto grid gap-3 px-4 py-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              Secure payments
            </div>
            <div className="flex items-center gap-2 text-sm">
              <PackageCheck className="h-4 w-4 text-primary" />
              Admin-reviewed requests
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Curated artist portfolios
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Top-rated custom gifts</h2>
              <p className="text-xs text-muted-foreground">Fast inspiration from highly rated sample work.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="#artworks">See all</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {topRated.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artwork/${artwork.id}`}
                className="group overflow-hidden rounded-md border bg-card"
              >
                <div className="aspect-square bg-muted">
                  <img src={artwork.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-medium">{artwork.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-warning" />
                    {getRating(artwork).toFixed(1)} - {formatPrice(artwork)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="artworks" className="container mx-auto px-4 pb-10">
          <div className="rounded-md border bg-card">
            <div className="border-b p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold">All custom gift listings</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading marketplace..." : `${filteredArtworks.length} results from ${artworks.length} listings`}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-[160px_160px_180px]">
                  <Select value={price} onValueChange={(value) => setPrice(value as PriceFilter)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="under100">Under $100</SelectItem>
                      <SelectItem value="100to250">$100 - $250</SelectItem>
                      <SelectItem value="250plus">$250+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={rating} onValueChange={(value) => setRating(value as RatingFilter)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="4plus">4.0+</SelectItem>
                      <SelectItem value="45plus">4.5+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <div key={index} className="rounded-md border bg-background p-2">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="mt-3 h-4 w-4/5" />
                      <Skeleton className="mt-2 h-4 w-2/3" />
                      <Skeleton className="mt-3 h-8 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredArtworks.length === 0 ? (
                <div className="rounded-md border border-dashed p-10 text-center">
                  <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                  <p className="font-medium">No matching gifts found</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or searching another category.</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredArtworks.map((artwork) => (
                    <MarketplaceTile
                      key={artwork.id}
                      artwork={artwork}
                      isFavorite={favorites.includes(artwork.id)}
                      isLoggedIn={isLoggedIn}
                      onFavorite={() => toggleFavorite(artwork.id)}
                      onRequest={() => startRequest(artwork)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

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
