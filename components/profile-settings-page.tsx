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
import { getCurrentProfile, updateProfile } from "@/lib/supabase/queries"
import type { GiftCategory, Profile, UpdateProfileInput, UserRole } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { Check, Save } from "lucide-react"

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
