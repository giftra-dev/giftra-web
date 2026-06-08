"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArtworkCard } from "@/components/marketplace/artwork-card"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { readWishlist, writeWishlist } from "@/components/marketplace/utils"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { Button } from "@/components/ui/button"
import {
  getCurrentUser,
  getPublicArtworks,
  getWishlistArtworkIds,
  syncWishlistItems,
  toggleWishlistItem,
} from "@/lib/supabase/queries"
import type { ArtistArtworkWithArtist, GiftCategory } from "@/lib/types/database"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const [artworks, setArtworks] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)

  useEffect(() => {
    async function loadWishlist() {
      const localWishlist = readWishlist()
      setFavorites(localWishlist)
      const [items, userData] = await Promise.all([
        getPublicArtworks(),
        getCurrentUser().catch(() => ({ user: null })),
      ])

      if (userData.user) {
        if (localWishlist.length > 0) {
          await syncWishlistItems(userData.user.id, localWishlist)
        }
        const dbWishlist = await getWishlistArtworkIds(userData.user.id)
        setFavorites(dbWishlist)
        writeWishlist(dbWishlist)
        setUserId(userData.user.id)
      }

      setArtworks(items)
      setIsLoggedIn(Boolean(userData.user))
    }

    loadWishlist()
  }, [])

  const savedArtworks = useMemo(() => {
    return artworks.filter((artwork) => favorites.includes(artwork.id))
  }, [artworks, favorites])

  const toggleFavorite = async (artworkId: string) => {
    const shouldSave = !favorites.includes(artworkId)

    setFavorites((current) => {
      const next = current.includes(artworkId)
        ? current.filter((id) => id !== artworkId)
        : [...current, artworkId]
      writeWishlist(next)
      return next
    })

    if (userId) {
      await toggleWishlistItem(userId, artworkId, shouldSave)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <MarketplaceHeader wishlistCount={favorites.length} />
      <div className="container mx-auto px-4 py-6">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Saved gift ideas</h1>
              <p className="text-sm text-muted-foreground">
                {isLoggedIn ? "Saved custom gift ideas are synced to your Giftra account." : "Saved custom gift ideas live in this browser until you sign in."}
              </p>
            </div>
          </div>
        </section>

        <section className="py-5">
          {savedArtworks.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-10 text-center shadow-sm">
              <p className="font-medium">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Save artwork samples while browsing and come back when you are ready to request.</p>
              <Button asChild className="mt-5">
                <Link href="/">Browse marketplace</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {savedArtworks.map((artwork) => (
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
          inspirationArtworkId={selectedArtwork.id}
        />
      )}
    </main>
  )
}
