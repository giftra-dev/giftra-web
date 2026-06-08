"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getAllArtworksForAdmin, updateArtworkApproval } from "@/lib/supabase/queries"
import type { ArtistArtwork } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { CheckCircle, RefreshCw, XCircle } from "lucide-react"

type AdminArtwork = Awaited<ReturnType<typeof getAllArtworksForAdmin>>[number]

const statusVariant: Record<ArtistArtwork["approval_status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<AdminArtwork[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  async function loadArtworks() {
    setLoading(true)
    setArtworks(await getAllArtworksForAdmin())
    setLoading(false)
  }

  useEffect(() => {
    loadArtworks()
  }, [])

  const pendingCount = useMemo(
    () => artworks.filter((artwork) => artwork.approval_status === "pending").length,
    [artworks]
  )

  async function reviewArtwork(artwork: AdminArtwork, status: ArtistArtwork["approval_status"]) {
    await updateArtworkApproval(artwork.id, status, notes[artwork.id] || artwork.approval_notes || undefined)
    await loadArtworks()
  }

  return (
    <DashboardLayout>
      <main className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Artwork Review</h1>
            <p className="text-sm text-muted-foreground">Approve artist uploads before they appear in marketplace and portfolios.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{pendingCount} pending</Badge>
            <Button variant="outline" onClick={loadArtworks}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">Loading artwork submissions...</CardContent>
          </Card>
        ) : artworks.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No artwork submissions yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {artworks.map((artwork) => (
              <Card key={artwork.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{artwork.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {artwork.artist?.full_name || artwork.artist?.email || "Artist"} · {CATEGORY_LABELS[artwork.category]}
                    </p>
                  </div>
                  <Badge variant={statusVariant[artwork.approval_status]} className="capitalize">
                    {artwork.approval_status}
                  </Badge>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[220px_1fr_320px]">
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-md border bg-muted">
                      <img src={artwork.image_url} alt="" className="aspect-square h-full w-full object-cover" />
                    </div>
                    {(artwork.image_urls || []).length > 1 && (
                      <div className="grid grid-cols-4 gap-1">
                        {artwork.image_urls.slice(0, 4).map((imageUrl) => (
                          <img key={imageUrl} src={imageUrl} alt="" className="aspect-square rounded-sm object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>{artwork.description || "No description provided."}</p>
                    <p className="text-muted-foreground">
                      Price: {artwork.price_min || 0} - {artwork.price_max || artwork.price_min || 0}
                    </p>
                    <p className="text-muted-foreground">Tags: {artwork.tags?.join(", ") || "None"}</p>
                    {artwork.approval_status === "approved" && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/artwork/${artwork.id}`}>Open public listing</Link>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      value={notes[artwork.id] ?? artwork.approval_notes ?? ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))}
                      placeholder="Approval or rejection notes"
                      rows={4}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => reviewArtwork(artwork, "approved")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reviewArtwork(artwork, "rejected")}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
