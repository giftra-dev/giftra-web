"use client"

import { useEffect, useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createRequest, getCurrentUser, uploadFileToStorage } from "@/lib/supabase/queries"
import type { GiftCategory } from "@/lib/types/database"
import { CATEGORY_LABELS } from "@/lib/types/database"
import { Calendar, DollarSign, Gift, MapPin, Sparkles, Upload } from "lucide-react"

const categories: { label: string; value: GiftCategory }[] = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as GiftCategory, label })
)
const draftKey = "giftra:create-request-draft"

interface CreateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialTitle?: string
  initialDescription?: string
  initialCategory?: GiftCategory
  initialBudgetMin?: number
  initialBudgetMax?: number
  assignedArtistId?: string
  inspirationArtworkId?: string
}

export function CreateRequestDialog({
  open,
  onOpenChange,
  onSuccess,
  initialTitle,
  initialDescription,
  initialCategory,
  initialBudgetMin,
  initialBudgetMax,
  assignedArtistId,
  inspirationArtworkId,
}: CreateRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [title, setTitle] = useState(initialTitle || "")
  const [category, setCategory] = useState<GiftCategory | "">(initialCategory || "")
  const [description, setDescription] = useState(initialDescription || "")
  const [personalization, setPersonalization] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [occasion, setOccasion] = useState("")
  const [budgetMin, setBudgetMin] = useState(initialBudgetMin?.toString() || "")
  const [budgetMax, setBudgetMax] = useState(initialBudgetMax?.toString() || "")
  const [deadline, setDeadline] = useState("")
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])

  useEffect(() => {
    if (!open || initialTitle || initialDescription || inspirationArtworkId) return
    const saved = localStorage.getItem(draftKey)
    if (!saved) return
    try {
      const draft = JSON.parse(saved) as Record<string, string>
      setTitle(draft.title || "")
      setCategory((draft.category as GiftCategory) || "")
      setDescription(draft.description || "")
      setPersonalization(draft.personalization || "")
      setDeliveryAddress(draft.deliveryAddress || "")
      setRecipientName(draft.recipientName || "")
      setOccasion(draft.occasion || "")
      setBudgetMin(draft.budgetMin || "")
      setBudgetMax(draft.budgetMax || "")
      setDeadline(draft.deadline || "")
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [initialDescription, initialTitle, inspirationArtworkId, open])

  const draftPayload = useMemo(() => ({
    title,
    category,
    description,
    personalization,
    deliveryAddress,
    recipientName,
    occasion,
    budgetMin,
    budgetMax,
    deadline,
  }), [budgetMax, budgetMin, category, deadline, deliveryAddress, description, occasion, personalization, recipientName, title])

  useEffect(() => {
    if (!open) return
    localStorage.setItem(draftKey, JSON.stringify(draftPayload))
  }, [draftPayload, open])

  const resetForm = () => {
    setTitle(initialTitle || "")
    setCategory(initialCategory || "")
    setDescription(initialDescription || "")
    setPersonalization("")
    setDeliveryAddress("")
    setRecipientName("")
    setOccasion("")
    setBudgetMin(initialBudgetMin?.toString() || "")
    setBudgetMax(initialBudgetMax?.toString() || "")
    setDeadline("")
    setReferenceFiles([])
    setError("")
    localStorage.removeItem(draftKey)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const minBudget = Number.parseInt(budgetMin, 10)
    const maxBudget = Number.parseInt(budgetMax, 10)

    if (!category) {
      setError("Please select a category.")
      setIsLoading(false)
      return
    }

    if (!Number.isFinite(minBudget) || !Number.isFinite(maxBudget) || maxBudget < minBudget) {
      setError("Please enter a valid budget range.")
      setIsLoading(false)
      return
    }

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        throw new Error("Please sign in before creating a request.")
      }

      const referenceImages = await Promise.all(
        referenceFiles.map(async (file) => {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
          const { url, error: uploadError } = await uploadFileToStorage(
            "reference-images",
            `${user.id}/${Date.now()}-${safeName}`,
            file
          )
          if (uploadError) throw uploadError
          return url
        })
      )

      const { data, error: requestError } = await createRequest({
        title: title || `${CATEGORY_LABELS[category]} Request`,
        category,
        description: [
          description,
          personalization ? `Personalization details: ${personalization}` : "",
          deliveryAddress ? `Delivery address/city: ${deliveryAddress}` : "",
        ].filter(Boolean).join("\n\n"),
        recipient_name: recipientName || undefined,
        occasion: occasion || undefined,
        budget_min: minBudget,
        budget_max: maxBudget,
        deadline: deadline || undefined,
        reference_images: referenceImages.filter((url): url is string => Boolean(url)),
        assigned_artist_id: assignedArtistId,
        inspiration_artwork_id: inspirationArtworkId,
      })

      if (requestError) {
        throw requestError
      }

      onOpenChange(false)
      resetForm()
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create request."
      setError(
        message.includes("foreign key constraint")
          ? "This artwork or artist is no longer available. Please refresh the page and choose another listing."
          : message
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Gift Request</DialogTitle>
          <DialogDescription>
            Share the recipient, occasion, budget, deadline, references, and personalization details. Giftra reviews the brief, the artist accepts, then you approve the final price before payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm md:grid-cols-3">
            <div className="flex gap-2">
              <Gift className="mt-0.5 h-4 w-4 text-primary" />
              <span>Create a brief</span>
            </div>
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <span>Discuss and fix price</span>
            </div>
            <div className="flex gap-2">
              <DollarSign className="mt-0.5 h-4 w-4 text-primary" />
              <span>Pay after approval</span>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-semibold">1. Gift idea</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Family Portrait for Anniversary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as GiftCategory)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your gift idea in detail... style, colors, size, materials, mood"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-semibold">2. Recipient and personalization</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="Who is this gift for?"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  placeholder="Birthday, wedding, anniversary..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="personalization">Personalization details</Label>
                <Textarea
                  id="personalization"
                  value={personalization}
                  onChange={(event) => setPersonalization(event.target.value)}
                  placeholder="Names, dates, message text, colors, size, likes/dislikes..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-semibold">3. Budget and delivery</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Min Budget ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="50"
                  className="pl-10"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Max Budget ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="200"
                  className="pl-10"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  min={parseInt(budgetMin) || 1}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="deadline"
                type="date"
                className="pl-10"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={minDateStr}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="deliveryAddress">Delivery address or city</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="City, area, or full address if known"
                className="pl-10"
              />
            </div>
          </div>
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-semibold">4. Reference images</p>
            <Label>Reference Images (Optional)</Label>
            <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {referenceFiles.length > 0
                  ? `${referenceFiles.length} file${referenceFiles.length === 1 ? "" : "s"} selected`
                  : "Drag and drop images here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => setReferenceFiles(Array.from(event.target.files || []))}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
