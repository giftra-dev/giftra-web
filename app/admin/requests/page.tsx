"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Check
} from "lucide-react"
import { useGiftraStore, type RequestStatus, type GiftRequest } from "@/lib/store"

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  admin_review: "bg-warning/20 text-warning-foreground border-warning/30",
  artist_assigned: "bg-info/20 text-info-foreground border-info/30",
  awaiting_payment: "bg-accent text-accent-foreground",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

const statusLabels: Record<RequestStatus, string> = {
  pending: "Pending",
  admin_review: "Under Review",
  artist_assigned: "Artist Assigned",
  awaiting_payment: "Awaiting Payment",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

function AdminRequestsContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<GiftRequest | null>(null)
  const [selectedArtist, setSelectedArtist] = useState("")
  const [price, setPrice] = useState("")

  const { requests, users, artistProfiles, assignArtist, updateRequestStatus } = useGiftraStore()

  const filteredRequests = requests
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => 
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAssign = () => {
    if (selectedRequest && selectedArtist && price) {
      assignArtist(selectedRequest.id, selectedArtist, parseInt(price))
      setAssignDialogOpen(false)
      setSelectedRequest(null)
      setSelectedArtist("")
      setPrice("")
    }
  }

  const openAssignDialog = (request: GiftRequest) => {
    setSelectedRequest(request)
    setPrice(Math.floor((request.budgetMin + request.budgetMax) / 2).toString())
    setAssignDialogOpen(true)
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="admin_review">Under Review</SelectItem>
            <SelectItem value="artist_assigned">Artist Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
              {filteredRequests.map((request) => {
                const customer = users.find(u => u.id === request.customerId)
                const artist = request.assignedArtistId 
                  ? artistProfiles.find(a => a.id === request.assignedArtistId)
                  : null

                return (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{request.category}</h3>
                          <Badge variant="outline" className={statusColors[request.status]}>
                            {statusLabels[request.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {customer?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${request.budgetMin} - ${request.budgetMax}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(request.deadline).toLocaleDateString()}
                          </span>
                          {artist && (
                            <span className="text-primary">
                              Assigned to: {artist.name}
                            </span>
                          )}
                          {request.adminPrice && (
                            <span className="text-primary font-medium">
                              Price set: ${request.adminPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(request.status === "pending" || request.status === "admin_review") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, "admin_review")}
                            >
                              Mark Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openAssignDialog(request)}
                            >
                              Assign Artist
                            </Button>
                          </>
                        )}
                        {request.status === "artist_assigned" && (
                          <Badge variant="outline" className="bg-success/20 text-success-foreground">
                            <Check className="w-3 h-3 mr-1" />
                            Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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
                <p className="font-medium text-sm">{selectedRequest.category}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedRequest.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Budget: ${selectedRequest.budgetMin} - ${selectedRequest.budgetMax}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Select Artist</Label>
                <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                  <SelectTrigger id="artist">
                    <SelectValue placeholder="Choose an artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artistProfiles.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        <div className="flex items-center gap-2">
                          <span>{artist.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({artist.specialties.slice(0, 2).join(", ")})
                          </span>
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
                    min={selectedRequest.budgetMin}
                    max={selectedRequest.budgetMax}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer budget: ${selectedRequest.budgetMin} - ${selectedRequest.budgetMax}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={!selectedArtist || !price}>
                  Assign & Set Price
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
