"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { getAllArtists, updateUserProfile } from "@/lib/supabase/queries"
import type { Profile } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { ExternalLink, Search, Star, UserCheck } from "lucide-react"

function AdminArtistsContent() {
  const [artists, setArtists] = useState<Profile[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingArtistId, setUpdatingArtistId] = useState<string | null>(null)

  const loadArtists = useCallback(async () => {
    try {
      setArtists(await getAllArtists())
    } catch (error) {
      console.error("Error loading artists:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArtists()
  }, [loadArtists])

  const filteredArtists = artists.filter((artist) => {
    const searchText = [
      artist.full_name,
      artist.email,
      artist.bio,
      ...(artist.specialties || []).map((specialty) => CATEGORY_LABELS[specialty] || specialty),
    ].join(" ").toLowerCase()
    return searchText.includes(search.toLowerCase())
  })

  const toggleAvailability = async (artist: Profile, isAvailable: boolean) => {
    setUpdatingArtistId(artist.id)
    const { data, error } = await updateUserProfile(artist.id, { is_available: isAvailable })
    if (error) {
      console.error("Error updating artist:", error)
    } else if (data) {
      setArtists((current) => current.map((item) => (item.id === data.id ? data : item)))
    }
    setUpdatingArtistId(null)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-muted-foreground">Review artist profiles, availability, ratings, and specialties</p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search artists..."
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredArtists.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No artists found</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredArtists.map((artist) => (
                  <div key={artist.id} className="p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium">{artist.full_name || "Unnamed artist"}</h3>
                            <Badge variant="outline" className={artist.is_available ? "bg-success/20 text-success-foreground" : ""}>
                              {artist.is_available ? "Available" : "Unavailable"}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {artist.rating.toFixed(1)} ({artist.total_reviews})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{artist.email}</p>
                          {artist.bio && <p className="text-sm mt-2 line-clamp-2">{artist.bio}</p>}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(artist.specialties || []).length === 0 ? (
                              <Badge variant="outline">No specialties</Badge>
                            ) : (
                              artist.specialties.map((specialty) => (
                                <Badge key={specialty} variant="outline">
                                  {CATEGORY_LABELS[specialty] || specialty}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={artist.is_available}
                            onCheckedChange={(checked: boolean) => toggleAvailability(artist, checked)}
                            disabled={updatingArtistId === artist.id}
                          />
                          Assignable
                        </label>
                        {artist.portfolio_url && (
                          <Button asChild variant="outline" size="sm" className="gap-1">
                            <a href={artist.portfolio_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4" />
                              Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminArtistsPage() {
  return <AdminArtistsContent />
}
