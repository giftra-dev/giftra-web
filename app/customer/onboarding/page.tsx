"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentProfile, updateProfile } from "@/lib/supabase/queries"
import type { GiftCategory } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { CheckCircle, Gift, MapPin, WalletCards } from "lucide-react"

const categories = Object.entries(CATEGORY_LABELS) as Array<[GiftCategory, string]>

export default function CustomerOnboardingPage() {
  const router = useRouter()
  const [occasion, setOccasion] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<GiftCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getCurrentProfile().then((profile) => {
      const preferences = profile?.customer_preferences as Record<string, unknown> | undefined
      if (!preferences) return
      setOccasion(String(preferences.occasion || ""))
      setBudgetMin(preferences.budget_min ? String(preferences.budget_min) : "")
      setBudgetMax(preferences.budget_max ? String(preferences.budget_max) : "")
      setDeliveryCity(String(preferences.delivery_city || ""))
      setSelectedCategories(Array.isArray(preferences.preferred_categories) ? preferences.preferred_categories as GiftCategory[] : [])
    })
  }, [])

  const toggleCategory = (category: GiftCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    )
  }

  const savePreferences = async () => {
    setSaving(true)
    setError("")
    const profile = await getCurrentProfile()
    if (!profile) {
      setError("Please sign in again to finish onboarding.")
      setSaving(false)
      return
    }

    const { error: updateError } = await updateProfile(profile.id, {
      customer_preferences: {
        occasion,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        delivery_city: deliveryCity,
        preferred_categories: selectedCategories,
        onboarding_completed_at: new Date().toISOString(),
      },
    })

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push("/customer/dashboard")
  }

  return (
    <DashboardLayout>
      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <Badge className="mb-3 rounded-full">Customer setup</Badge>
            <h1 className="text-2xl font-bold">Tell Giftra what you usually gift for</h1>
            <p className="mt-2 text-muted-foreground">
              These preferences help us prefill requests, recommend artists, and keep your custom gift flow faster.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Occasion</CardTitle>
                <CardDescription>What are you shopping for first?</CardDescription>
              </CardHeader>
              <CardContent>
                <Input value={occasion} onChange={(event) => setOccasion(event.target.value)} placeholder="Birthday, wedding, anniversary..." />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <WalletCards className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Budget</CardTitle>
                <CardDescription>Your comfortable starting range.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Input value={budgetMin} onChange={(event) => setBudgetMin(event.target.value)} type="number" placeholder="Min" />
                <Input value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} type="number" placeholder="Max" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Delivery city</CardTitle>
                <CardDescription>Used for delivery expectations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input value={deliveryCity} onChange={(event) => setDeliveryCity(event.target.value)} placeholder="City" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preferred categories</CardTitle>
              <CardDescription>Select a few gift styles you are likely to request.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(([value, label]) => (
                <Label key={value} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/60">
                  <Checkbox checked={selectedCategories.includes(value)} onCheckedChange={() => toggleCategory(value)} />
                  <span>{label}</span>
                </Label>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => router.push("/customer/dashboard")}>
              Skip for now
            </Button>
            <Button onClick={savePreferences} disabled={saving} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {saving ? "Saving..." : "Save preferences"}
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
