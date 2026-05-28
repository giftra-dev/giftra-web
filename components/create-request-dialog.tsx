"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { useGiftraStore } from "@/lib/store"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import { createGiftRequest } from "@/lib/supabase/workflow"
import type { GiftCategory } from "@/lib/types/database"
import { Calendar, DollarSign, Upload } from "lucide-react"

const categories: { label: string; value: GiftCategory }[] = [
  { label: "Portrait", value: "portrait" },
  { label: "Digital Art", value: "digital_art" },
  { label: "Custom Jewelry", value: "custom_jewelry" },
  { label: "Caricature", value: "caricature" },
  { label: "Calligraphy", value: "calligraphy" },
  { label: "Illustration", value: "illustration" },
  { label: "Woodwork", value: "woodwork" },
  { label: "Pottery", value: "pottery" },
  { label: "Textile", value: "textile" },
  { label: "Other", value: "other" },
]

interface CreateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const router = useRouter()
  const createRequest = useGiftraStore(state => state.createRequest)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [category, setCategory] = useState<GiftCategory | "">("")
  const [description, setDescription] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [deadline, setDeadline] = useState("")

  const resetForm = () => {
    setCategory("")
    setDescription("")
    setBudgetMin("")
    setBudgetMax("")
    setDeadline("")
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
      if (hasSupabaseConfig) {
        const { error: requestError } = await createGiftRequest({
          category,
          description,
          budget_min: minBudget,
          budget_max: maxBudget,
          deadline,
          reference_images: [],
        })

        if (requestError) {
          throw requestError
        }
      } else {
        createRequest({
          category,
          description,
          budgetMin: minBudget,
          budgetMax: maxBudget,
          deadline: new Date(deadline),
          referenceImages: [],
        })
      }

      onOpenChange(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create request.")
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
      <DialogContent className="sm:max-w-lg">
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
            <Label htmlFor="category">Category</Label>
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
                  <SelectItem key={`${cat.value}-${cat.label}`} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="budgetMin">Min Budget ($)</Label>
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
              <Label htmlFor="budgetMax">Max Budget ($)</Label>
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
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reference Images (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </p>
            </div>
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
