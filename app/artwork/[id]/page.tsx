"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArtworkCard } from "@/components/marketplace/artwork-card"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { anonymousArtistName, formatArtworkPrice, getArtworkRating, readWishlist, writeWishlist } from "@/components/marketplace/utils"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  getCurrentUser,
  getPublicArtworkById,
  getPublicArtworks,
  getWishlistArtworkIds,
  submitArtworkReport,
  syncWishlistItems,
  toggleWishlistItem,
} from "@/lib/supabase/queries"
import type { ArtistArtworkWithArtist, GiftCategory } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { ArrowLeft, BadgeCheck, Flag, Heart, ShieldCheck, Star, Truck } from "lucide-react"

export default function ArtworkDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [artwork, setArtwork] = useState<ArtistArtworkWithArtist | null>(null)
  const [related, setRelated] = useState<ArtistArtworkWithArtist[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestOpen, setRequestOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportDetails, setReportDetails] = useState("")
  const [reportMessage, setReportMessage] = useState("")
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    async function loadArtwork() {
      const wishlist = readWishlist()
      setFavorites(wishlist)

      const [item, items, userData] = await Promise.all([
        getPublicArtworkById(params.id),
        getPublicArtworks(),
        getCurrentUser().catch(() => ({ user: null })),
      ])

      if (userData.user) {
        if (wishlist.length > 0) {
          await syncWishlistItems(userData.user.id, wishlist)
        }
        const dbWishlist = await getWishlistArtworkIds(userData.user.id)
        setFavorites(dbWishlist)
        writeWishlist(dbWishlist)
        setUserId(userData.user.id)
      }

      setArtwork(item)
      setIsLoggedIn(Boolean(userData.user))
      setRelated(items.filter((candidate) => candidate.id !== params.id && candidate.category === item?.category).slice(0, 6))
      setIsLoading(false)

      if (item && userData.user && searchParams.get("request") === "1") {
        setRequestOpen(true)
      }
    }

    loadArtwork()
  }, [params.id, searchParams])

  const isFavorite = artwork ? favorites.includes(artwork.id) : false

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

  const handleReport = async () => {
    if (!artwork) return

    if (!isLoggedIn) {
      window.location.href = `/auth/login?redirect=/artwork/${artwork.id}`
      return
    }

    setIsReporting(true)
    setReportMessage("")

    const { error } = await submitArtworkReport({
      artwork_id: artwork.id,
      artist_id: artwork.artist_id,
      reason: "listing_concern",
      details: reportDetails || "Customer reported this listing for admin review.",
    })

    setIsReporting(false)
    if (error) {
      setReportMessage(error.message)
      return
    }

    setReportMessage("Thanks. Giftra admin will review this listing.")
    setReportDetails("")
  }

  const tags = useMemo(() => artwork?.tags?.filter(Boolean).slice(0, 8) || [], [artwork])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <MarketplaceHeader wishlistCount={favorites.length} />
        <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[1fr_420px]">
          <Skeleton className="aspect-square w-full rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (!artwork) {
    return (
      <main className="min-h-screen bg-muted/30">
        <MarketplaceHeader wishlistCount={favorites.length} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg font-semibold">Artwork not found</p>
          <p className="mt-2 text-sm text-muted-foreground">This listing may be private or unavailable.</p>
          <Button asChild className="mt-5">
            <Link href="/">Back to marketplace</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <MarketplaceHeader wishlistCount={favorites.length} />
      <div className="container mx-auto px-4 py-4">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <section className="grid gap-6 rounded-md border bg-card p-4 lg:grid-cols-[1fr_420px]">
          <div className="overflow-hidden rounded-md bg-muted">
            <img src={artwork.image_url} alt="" className="aspect-square h-full w-full object-cover" />
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <Badge variant="outline">{CATEGORY_LABELS[artwork.category]}</Badge>
              <h1 className="mt-3 text-3xl font-bold leading-tight">{artwork.title}</h1>
              <Link href={`/artists/${artwork.artist_id}`} className="mt-2 block text-sm text-primary hover:underline">
                {anonymousArtistName(artwork.artist_id)}
              </Link>
              <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-warning" />
                  {getArtworkRating(artwork) ? getArtworkRating(artwork).toFixed(1) : "New"}
                </span>
                <span>{artwork.artist?.total_reviews || 0} reviews</span>
                {artwork.artist?.is_available ? <span className="text-success">Available</span> : <span>Limited availability</span>}
              </div>
            </div>

            <div>
              <p className="text-3xl font-bold">{formatArtworkPrice(artwork)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Final quote depends on size, deadline, materials, and personalization.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Estimated custom timeline: 5-14 days after quote approval, depending on complexity and shipping.
              </p>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">{artwork.description || "Use this sample as inspiration for a made-to-order custom gift."}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-sm">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              {isLoggedIn ? (
                <Button size="lg" onClick={() => setRequestOpen(true)}>
                  Request this style
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href={`/auth/signup?role=customer&next=/artwork/${artwork.id}?request=1`}>
                    Request this style
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={() => toggleFavorite(artwork.id)}>
                <Heart className={isFavorite ? "mr-2 h-4 w-4 fill-current" : "mr-2 h-4 w-4"} />
                {isFavorite ? "Saved to wishlist" : "Add to wishlist"}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setReportOpen(true)}>
                <Flag className="mr-2 h-4 w-4" />
                Report listing
              </Button>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-md border p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
                Protected payment
              </div>
              <div className="rounded-md border p-3">
                <BadgeCheck className="mb-2 h-4 w-4 text-primary" />
                Admin reviewed
              </div>
              <div className="rounded-md border p-3">
                <Truck className="mb-2 h-4 w-4 text-primary" />
                Delivery tracking
              </div>
            </div>
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How this becomes your gift</p>
              <p className="mt-1">Share recipient, occasion, size, budget, deadline, and reference images. Giftra reviews the request, confirms the artist, and unlocks chat after payment.</p>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">More in {CATEGORY_LABELS[artwork.category]}</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/category/${artwork.category}`}>View category</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((item) => (
              <ArtworkCard
                key={item.id}
                artwork={item}
                isFavorite={favorites.includes(item.id)}
                isLoggedIn={isLoggedIn}
                onFavorite={() => toggleFavorite(item.id)}
                onRequest={() => {
                  setArtwork(item)
                  setRequestOpen(true)
                }}
              />
            ))}
          </div>
        </section>
      </div>

      <CreateRequestDialog
        key={artwork.id}
        open={requestOpen}
        onOpenChange={setRequestOpen}
        initialTitle={`Custom gift inspired by ${artwork.title}`}
        initialDescription={`I like this style: ${artwork.title}. ${artwork.description || ""}`.trim()}
        initialCategory={artwork.category as GiftCategory}
        initialBudgetMin={artwork.price_min || undefined}
        initialBudgetMax={artwork.price_max || artwork.price_min || undefined}
        preferredArtistId={artwork.artist_id}
        inspirationArtworkId={artwork.id}
      />

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report listing</DialogTitle>
            <DialogDescription>
              Tell Giftra admin what looks wrong. Reports are private and reviewed by the team.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            placeholder="Describe the issue, for example duplicate image, inappropriate content, misleading pricing..."
            rows={5}
          />
          {reportMessage ? <p className="text-sm text-muted-foreground">{reportMessage}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Close</Button>
            <Button onClick={handleReport} disabled={isReporting}>
              {isReporting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
