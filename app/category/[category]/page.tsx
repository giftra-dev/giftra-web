"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArtworkCard } from "@/components/marketplace/artwork-card"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { readWishlist, writeWishlist } from "@/components/marketplace/utils"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser, getPublicArtworks } from "@/lib/supabase/queries"
import type { ArtistArtworkWithArtist, GiftCategory } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { ArrowLeft, Search } from "lucide-react"

const validCategories = Object.keys(CATEGORY_LABELS) as GiftCategory[]

export default function CategoryPage() {
  const params = useParams<{ category: string }>()
  const category = validCategories.includes(params.category as GiftCategory) ? params.category as GiftCategory : null
  const [artworks, setArtworks] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("featured")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)

  useEffect(() => {
    async function loadCategory() {
      setFavorites(readWishlist())
      const [items, userData] = await Promise.all([
        getPublicArtworks(),
        getCurrentUser().catch(() => ({ user: null })),
      ])
      setArtworks(items)
      setIsLoggedIn(Boolean(userData.user))
    }

    loadCategory()
  }, [])

  const filtered = useMemo(() => {
    if (!category) return []

    const items = artworks.filter((artwork) => {
      const text = [artwork.title, artwork.description, ...(artwork.tags || [])].join(" ").toLowerCase()
      return artwork.category === category && text.includes(search.toLowerCase())
    })

    return items.sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === "rating") return (b.artist?.rating || 0) - (a.artist?.rating || 0)
      return Number(b.is_featured) - Number(a.is_featured)
    })
  }, [artworks, category, search, sort])

  const toggleFavorite = (artworkId: string) => {
    setFavorites((current) => {
      const next = current.includes(artworkId)
        ? current.filter((id) => id !== artworkId)
        : [...current, artworkId]
      writeWishlist(next)
      return next
    })
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-muted/30">
        <MarketplaceHeader wishlistCount={favorites.length} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="font-semibold">Unknown category</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to marketplace</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <MarketplaceHeader wishlistCount={favorites.length} />
      <div className="container mx-auto px-4 py-5">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <section className="rounded-md border bg-card p-5">
          <h1 className="text-3xl font-bold">{CATEGORY_LABELS[category]}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Browse custom gift samples and request a personalized version from an artist.</p>
          <div className="mt-5 grid gap-2 md:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${CATEGORY_LABELS[category].toLowerCase()}...`} className="pl-10" />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="py-5">
          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
              No listings found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  isFavorite={favorites.includes(artwork.id)}
                  isLoggedIn={isLoggedIn}
                  onFavorite={() => toggleFavorite(artwork.id)}
                  onRequest={() => {
                    setSelectedArtwork(artwork)
                    setRequestOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

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
