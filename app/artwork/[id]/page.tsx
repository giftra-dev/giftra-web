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
import { Input } from "@/components/ui/input"
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
  createArtworkFeedback,
  getArtworkFeedback,
  getPublicArtworkById,
  getPublicArtworks,
  getWishlistArtworkIds,
  submitArtworkReport,
  syncWishlistItems,
  toggleWishlistItem,
} from "@/lib/supabase/queries"
import type { ArtistArtworkWithArtist, ArtworkFeedbackWithRelations, GiftCategory } from "@/lib/types/database"
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
  const [feedback, setFeedback] = useState<ArtworkFeedbackWithRelations[]>([])
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackTitle, setFeedbackTitle] = useState("")
  const [feedbackContent, setFeedbackContent] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

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
      setFeedback(item ? await getArtworkFeedback(item.id) : [])
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
      window.location.href = `/auth/customer/login?redirect=/artwork/${artwork.id}`
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

  const handleFeedback = async () => {
    if (!artwork) return

    if (!isLoggedIn) {
      window.location.href = `/auth/customer/login?redirect=/artwork/${artwork.id}`
      return
    }

    setIsSubmittingFeedback(true)
    setFeedbackMessage("")
    const { error } = await createArtworkFeedback({
      artwork_id: artwork.id,
      artist_id: artwork.artist_id,
      rating: feedbackRating,
      title: feedbackTitle || undefined,
      content: feedbackContent || undefined,
    })
    setIsSubmittingFeedback(false)

    if (error) {
      setFeedbackMessage(error.message)
      return
    }

    setFeedbackMessage("Thanks. Your feedback has been saved.")
    setFeedbackTitle("")
    setFeedbackContent("")
    setFeedback(await getArtworkFeedback(artwork.id))
  }

  const tags = useMemo(() => artwork?.tags?.filter(Boolean).slice(0, 8) || [], [artwork])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
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
      <main className="min-h-screen bg-background">
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
    <main className="min-h-screen bg-background">
      <MarketplaceHeader wishlistCount={favorites.length} />
      <div className="container mx-auto px-4 py-4">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <section className="grid gap-6 rounded-lg border bg-card p-4 shadow-sm lg:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg bg-muted">
              <img src={artwork.image_url} alt="" className="aspect-square h-full w-full object-cover" />
            </div>
            {(artwork.image_urls || []).length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {artwork.image_urls.slice(0, 4).map((imageUrl) => (
                  <div key={imageUrl} className="overflow-hidden rounded-md border bg-muted">
                    <img src={imageUrl} alt="" className="aspect-square h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
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
                  <Link href={`/auth/customer/signup?next=/artwork/${artwork.id}?request=1`}>
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
              <div className="rounded-lg border p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
                Protected payment
              </div>
              <div className="rounded-lg border p-3">
                <BadgeCheck className="mb-2 h-4 w-4 text-primary" />
                Admin reviewed
              </div>
              <div className="rounded-lg border p-3">
                <Truck className="mb-2 h-4 w-4 text-primary" />
                Delivery tracking
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How this becomes your gift</p>
              <p className="mt-1">Share recipient, occasion, size, budget, deadline, and reference images. Giftra reviews the request, confirms the artist, and unlocks chat after payment.</p>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="mb-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="text-lg font-bold">Rate this artwork</h2>
              <p className="mt-1 text-sm text-muted-foreground">Share feedback for this art style and artist.</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={feedbackRating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackRating(rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <Input
                className="mt-3"
                value={feedbackTitle}
                onChange={(event) => setFeedbackTitle(event.target.value)}
                placeholder="Short title"
              />
              <Textarea
                className="mt-3"
                value={feedbackContent}
                onChange={(event) => setFeedbackContent(event.target.value)}
                placeholder="What did you like, or what should customers know?"
                rows={4}
              />
              {feedbackMessage ? <p className="mt-2 text-sm text-muted-foreground">{feedbackMessage}</p> : null}
              <Button className="mt-3 w-full" onClick={handleFeedback} disabled={isSubmittingFeedback}>
                {isLoggedIn ? (isSubmittingFeedback ? "Saving..." : "Save feedback") : "Sign in to rate"}
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Customer feedback</h2>
                <Badge variant="secondary">{feedback.length} reviews</Badge>
              </div>
              {feedback.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No direct artwork feedback yet.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {feedback.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.title || "Customer feedback"}</p>
                        <span className="flex items-center gap-1 text-sm text-warning">
                          <Star className="h-4 w-4 fill-current" />
                          {item.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.content || "Rated this artwork."}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {item.customer?.full_name || "Giftra customer"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
