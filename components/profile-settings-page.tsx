"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  createArtistArtwork,
  deleteArtistArtwork,
  getCurrentProfile,
  getMyArtistArtworks,
  updateProfile,
  uploadFileToStorage,
} from "@/lib/supabase/queries"
import type { ArtistArtwork, GiftCategory, Profile, UpdateProfileInput, UserRole } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, ImagePlus, Save, Trash2 } from "lucide-react"

const categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as GiftCategory,
  label,
}))

export function ProfileSettingsPage({ role }: { role: UserRole }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [specialties, setSpecialties] = useState<GiftCategory[]>([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [artworks, setArtworks] = useState<ArtistArtwork[]>([])
  const [artworkTitle, setArtworkTitle] = useState("")
  const [artworkDescription, setArtworkDescription] = useState("")
  const [artworkCategory, setArtworkCategory] = useState<GiftCategory>("portrait")
  const [artworkPriceMin, setArtworkPriceMin] = useState("")
  const [artworkPriceMax, setArtworkPriceMax] = useState("")
  const [artworkTags, setArtworkTags] = useState("")
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [isAddingArtwork, setIsAddingArtwork] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const currentProfile = await getCurrentProfile()
      if (currentProfile) {
        setProfile(currentProfile)
        setFullName(currentProfile.full_name || "")
        setPhone(currentProfile.phone || "")
        setBio(currentProfile.bio || "")
        setPortfolioUrl(currentProfile.portfolio_url || "")
        setSpecialties(currentProfile.specialties || [])
        setIsAvailable(currentProfile.is_available)
        if (currentProfile.role === "artist") {
          setArtworks(await getMyArtistArtworks(currentProfile.id))
        }
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [])

  const toggleSpecialty = (category: GiftCategory) => {
    setSpecialties((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    )
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setMessage("")
    setError("")

    const updates: UpdateProfileInput = {
      full_name: fullName || undefined,
      phone: phone || undefined,
    }

    if (role === "artist") {
      updates.bio = bio || undefined
      updates.portfolio_url = portfolioUrl || undefined
      updates.specialties = specialties
      updates.is_available = isAvailable
    }

    const { data, error: updateError } = await updateProfile(profile.id, updates)
    if (updateError) {
      setError(updateError.message)
    } else if (data) {
      setProfile(data)
      setMessage("Settings saved.")
    }

    setIsSaving(false)
  }

  const resetArtworkForm = () => {
    setArtworkTitle("")
    setArtworkDescription("")
    setArtworkCategory("portrait")
    setArtworkPriceMin("")
    setArtworkPriceMax("")
    setArtworkTags("")
    setArtworkFile(null)
  }

  const handleAddArtwork = async () => {
    if (!profile || !artworkFile || !artworkTitle) {
      setError("Please add a title and artwork image.")
      return
    }

    setIsAddingArtwork(true)
    setError("")
    setMessage("")

    const safeName = artworkFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")
    const { url, error: uploadError } = await uploadFileToStorage(
      "artist-artworks",
      `${profile.id}/${Date.now()}-${safeName}`,
      artworkFile
    )

    if (uploadError || !url) {
      setError(uploadError?.message || "Unable to upload artwork.")
      setIsAddingArtwork(false)
      return
    }

    const { data, error: createError } = await createArtistArtwork({
      artist_id: profile.id,
      title: artworkTitle,
      description: artworkDescription || undefined,
      category: artworkCategory,
      image_url: url,
      price_min: artworkPriceMin ? Number.parseInt(artworkPriceMin, 10) : undefined,
      price_max: artworkPriceMax ? Number.parseInt(artworkPriceMax, 10) : undefined,
      tags: artworkTags.split(",").map((tag) => tag.trim()).filter(Boolean),
    })

    if (createError) {
      setError(createError.message)
    } else if (data) {
      setArtworks((current) => [data, ...current])
      setMessage("Artwork added to your public portfolio.")
      resetArtworkForm()
    }

    setIsAddingArtwork(false)
  }

  const handleDeleteArtwork = async (artworkId: string) => {
    const { error: deleteError } = await deleteArtistArtwork(artworkId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setArtworks((current) => current.filter((artwork) => artwork.id !== artworkId))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Keep your profile and account details up to date</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <Check className="w-4 h-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile?.email || ""} disabled />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div>
                    <Badge variant="outline" className="capitalize">{profile?.role}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {role === "artist" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Marketplace Readiness</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Profile name", done: Boolean(fullName || profile?.full_name) },
                    { label: "Artist bio", done: bio.trim().length >= 20 },
                    { label: "Specialties", done: specialties.length > 0 },
                    { label: "Portfolio samples", done: artworks.length > 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                      <span className={item.done ? "flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground" : "h-6 w-6 rounded-full border"} >
                        {item.done ? <Check className="h-4 w-4" /> : null}
                      </span>
                      <span className={item.done ? "font-medium" : "text-muted-foreground"}>{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Artist Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" rows={5} value={bio} onChange={(event) => setBio(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={portfolioUrl}
                      onChange={(event) => setPortfolioUrl(event.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Specialties</Label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <label
                          key={category.value}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={specialties.includes(category.value)}
                            onCheckedChange={() => toggleSpecialty(category.value)}
                          />
                          {category.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={isAvailable} onCheckedChange={(checked) => setIsAvailable(checked === true)} />
                    Available for new assignments
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Samples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="artworkTitle">Artwork Title</Label>
                        <Input id="artworkTitle" value={artworkTitle} onChange={(event) => setArtworkTitle(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="artworkDescription">Description</Label>
                        <Textarea
                          id="artworkDescription"
                          rows={3}
                          value={artworkDescription}
                          onChange={(event) => setArtworkDescription(event.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={artworkCategory} onValueChange={(value) => setArtworkCategory(value as GiftCategory)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artworkTags">Tags</Label>
                          <Input
                            id="artworkTags"
                            placeholder="modern, wedding"
                            value={artworkTags}
                            onChange={(event) => setArtworkTags(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="artworkPriceMin">Min Price</Label>
                          <Input
                            id="artworkPriceMin"
                            type="number"
                            value={artworkPriceMin}
                            onChange={(event) => setArtworkPriceMin(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artworkPriceMax">Max Price</Label>
                          <Input
                            id="artworkPriceMax"
                            type="number"
                            value={artworkPriceMax}
                            onChange={(event) => setArtworkPriceMax(event.target.value)}
                          />
                        </div>
                      </div>
                      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                        <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">{artworkFile ? artworkFile.name : "Upload sample photo"}</span>
                        <span className="text-xs text-muted-foreground">PNG or JPG recommended</span>
                        <Input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => setArtworkFile(event.target.files?.[0] || null)}
                        />
                      </label>
                      <Button type="button" onClick={handleAddArtwork} disabled={isAddingArtwork} className="w-full">
                        {isAddingArtwork ? "Adding..." : "Add Portfolio Sample"}
                      </Button>
                    </div>
                  </div>

                  {artworks.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {artworks.map((artwork) => (
                        <div key={artwork.id} className="overflow-hidden rounded-lg border">
                          <img src={artwork.image_url} alt="" className="aspect-square w-full object-cover" />
                          <div className="space-y-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{artwork.title}</p>
                                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[artwork.category]}</p>
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteArtwork(artwork.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
