"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search,
  Calendar,
  User,
  DollarSign,
  Check,
  X
} from "lucide-react"
import { 
  getAllRequests,
  getAllArtists,
  assignArtist,
  rejectRequest,
} from "@/lib/supabase/queries"
import type { RequestWithRelations, Profile } from "@/lib/types/database"
import { REQUEST_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types/database"

const statusColors: Record<string, string> = {
  pending_review: "bg-warning/20 text-warning-foreground border-warning/30",
  approved: "bg-info/20 text-info-foreground border-info/30",
  assigned: "bg-info/20 text-info-foreground border-info/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  delivered: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
  rejected: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

function AdminRequestsContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending_review")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null)
  const [selectedArtist, setSelectedArtist] = useState("")
  const [price, setPrice] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [artists, setArtists] = useState<Profile[]>([])

  const loadData = useCallback(async () => {
    try {
      const [requestsData, artistsData] = await Promise.all([
        getAllRequests(),
        getAllArtists(),
      ])

      setRequests(requestsData)
      setArtists(artistsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredRequests = requests
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => 
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleAssign = async () => {
    if (!selectedRequest || !selectedArtist || !price) return
    
    setIsSubmitting(true)
    try {
      const { error } = await assignArtist(
        selectedRequest.id, 
        selectedArtist, 
        parseInt(price)
      )
      
      if (error) {
        console.error('Error assigning artist:', error)
        return
      }

      setAssignDialogOpen(false)
      setSelectedRequest(null)
      setSelectedArtist("")
      setPrice("")
      loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) return
    
    setIsSubmitting(true)
    try {
      const { error } = await rejectRequest(selectedRequest.id, rejectReason)
      
      if (error) {
        console.error('Error rejecting request:', error)
        return
      }

      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectReason("")
      loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAssignDialog = (request: RequestWithRelations) => {
    setSelectedRequest(request)
    setPrice(Math.floor(((request.budget_min || 0) + (request.budget_max || 0)) / 2).toString())
    setAssignDialogOpen(true)
  }

  const openRejectDialog = (request: RequestWithRelations) => {
    setSelectedRequest(request)
    setRejectDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Requests Queue</h1>
        <p className="text-muted-foreground">Review and assign artists to gift requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="assigned">Artist Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {request.title || CATEGORY_LABELS[request.category] || request.category}
                        </h3>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {REQUEST_STATUS_LABELS[request.status] || request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.customer?.full_name || 'Unknown Customer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${request.budget_min} - ${request.budget_max}
                        </span>
                        {request.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(request.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {request.assigned_artist && (
                          <span className="text-primary">
                            Assigned to: {request.assigned_artist.full_name}
                          </span>
                        )}
                        {request.quoted_price && (
                          <span className="text-primary font-medium">
                            Price set: ${request.quoted_price}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === "pending_review" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(request)}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openAssignDialog(request)}
                          >
                            Assign Artist
                          </Button>
                        </>
                      )}
                      {request.status === "assigned" && (
                        <Badge variant="outline" className="bg-success/20 text-success-foreground">
                          <Check className="w-3 h-3 mr-1" />
                          Assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Artist Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Artist</DialogTitle>
            <DialogDescription>
              Select an artist and set the final price for this request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">
                  {selectedRequest.title || CATEGORY_LABELS[selectedRequest.category] || selectedRequest.category}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedRequest.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Budget: ${selectedRequest.budget_min} - ${selectedRequest.budget_max}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Select Artist</Label>
                <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                  <SelectTrigger id="artist">
                    <SelectValue placeholder="Choose an artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        <div className="flex items-center gap-2">
                          <span>{artist.full_name}</span>
                          {artist.specialties && artist.specialties.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({artist.specialties.slice(0, 2).map(s => CATEGORY_LABELS[s] || s).join(", ")})
                            </span>
                          )}
                          {artist.rating > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {artist.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Final Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    className="pl-10"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={selectedRequest.budget_min || 1}
                    max={selectedRequest.budget_max || undefined}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer budget: ${selectedRequest.budget_min} - ${selectedRequest.budget_max}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={!selectedArtist || !price || isSubmitting}>
                  {isSubmitting ? "Assigning..." : "Assign & Set Price"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">
                  {selectedRequest.title || CATEGORY_LABELS[selectedRequest.category] || selectedRequest.category}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this request cannot be fulfilled..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject} 
                  disabled={!rejectReason || isSubmitting}
                >
                  {isSubmitting ? "Rejecting..." : "Reject Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminRequestsPage() {
  return (
    <DashboardLayout>
      <AdminRequestsContent />
    </DashboardLayout>
  )
}
