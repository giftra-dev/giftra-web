"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Gift, Heart, Search, SlidersHorizontal, Star } from "lucide-react"

const favoriteStorageKey = "giftra:favorites"

function anonymousArtistName(artistId: string) {
  return `Giftra Artist ${artistId.slice(0, 4).toUpperCase()}`
}

export default function BrowsePage() {
  const [artworks, setArtworks] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [price, setPrice] = useState("all")
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function loadMarketplace() {
      const [artworkData, userData] = await Promise.all([
        getPublicArtworks(),
        getCurrentUser().catch(() => ({ user: null })),
      ])
      setArtworks(artworkData)
      setIsLoggedIn(Boolean(userData.user))
    }

    loadMarketplace()
    setFavorites(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]"))
  }, [])

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const text = [
        artwork.title,
        artwork.description,
        artwork.category,
        ...(artwork.tags || []),
        ...(artwork.artist?.specialties || []),
      ].join(" ").toLowerCase()
      const matchesSearch = text.includes(search.toLowerCase())
      const matchesCategory = category === "all" || artwork.category === category
      const max = artwork.price_max || artwork.price_min || 0
      const matchesPrice =
        price === "all" ||
        (price === "under100" && max <= 100) ||
        (price === "100to250" && max > 100 && max <= 250) ||
        (price === "250plus" && max > 250)

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [artworks, category, price, search])

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
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Gift className="h-5 w-5" />
            Giftra
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup?role=customer">Start Request</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight">Explore custom gifts before you sign up</h1>
            <p className="mt-3 text-muted-foreground">
              Browse real artist portfolio pieces, favorite ideas, compare styles, and raise a request when you find a direction you love.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search portraits, jewelry, woodwork, pottery..."
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger>
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="under100">Under $100</SelectItem>
                <SelectItem value="100to250">$100 - $250</SelectItem>
                <SelectItem value="250plus">$250+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {filteredArtworks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="font-medium">No artworks found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or ask artists to add portfolio samples.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArtworks.map((artwork) => {
              const isFavorite = favorites.includes(artwork.id)
              const artistName = anonymousArtistName(artwork.artist_id)
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
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge variant="outline">{CATEGORY_LABELS[artwork.category]}</Badge>
                        {artwork.artist?.rating ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {artwork.artist.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="font-semibold">{artwork.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{artwork.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Link href={`/artists/${artwork.artist_id}`} className="text-primary hover:underline">
                        {artistName}
                      </Link>
                      {(artwork.price_min || artwork.price_max) && (
                        <span className="font-medium">
                          ${artwork.price_min || artwork.price_max}
                          {artwork.price_max && artwork.price_max !== artwork.price_min ? ` - $${artwork.price_max}` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isLoggedIn ? (
                        <Button className="flex-1" onClick={() => startRequest(artwork)}>
                          Request Similar
                        </Button>
                      ) : (
                        <Button asChild className="flex-1" onClick={() => setSelectedArtwork(artwork)}>
                          <Link href={`/auth/signup?role=customer&next=/browse`}>
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
    </main>
  )
}
