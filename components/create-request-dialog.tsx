"use client"

import { useState } from "react"
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
import { Calendar, DollarSign, Upload } from "lucide-react"

const categories: { label: string; value: GiftCategory }[] = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as GiftCategory, label })
)

interface CreateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialTitle?: string
  initialDescription?: string
  initialCategory?: GiftCategory
  initialBudgetMin?: number
  initialBudgetMax?: number
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
  inspirationArtworkId,
}: CreateRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [title, setTitle] = useState(initialTitle || "")
  const [category, setCategory] = useState<GiftCategory | "">(initialCategory || "")
  const [description, setDescription] = useState(initialDescription || "")
  const [recipientName, setRecipientName] = useState("")
  const [occasion, setOccasion] = useState("")
  const [budgetMin, setBudgetMin] = useState(initialBudgetMin?.toString() || "")
  const [budgetMax, setBudgetMax] = useState(initialBudgetMax?.toString() || "")
  const [deadline, setDeadline] = useState("")
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])

  const resetForm = () => {
    setTitle(initialTitle || "")
    setCategory(initialCategory || "")
    setDescription(initialDescription || "")
    setRecipientName("")
    setOccasion("")
    setBudgetMin(initialBudgetMin?.toString() || "")
    setBudgetMax(initialBudgetMax?.toString() || "")
    setDeadline("")
    setReferenceFiles([])
    setError("")
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
        description,
        recipient_name: recipientName || undefined,
        occasion: occasion || undefined,
        budget_min: minBudget,
        budget_max: maxBudget,
        deadline: deadline || undefined,
        reference_images: referenceImages.filter((url): url is string => Boolean(url)),
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
            Describe the personalized gift you would like to create. Our admin team will review and match you with the perfect artist.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

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
              placeholder="Describe your gift idea in detail... (style, colors, size, special requirements)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="e.g., Birthday, Anniversary"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              />
            </div>
          </div>

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

          <div className="space-y-2">
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
