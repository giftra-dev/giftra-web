"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search,
  MessageSquare,
  Calendar,
  Filter
} from "lucide-react"
import { useGiftraStore, type RequestStatus } from "@/lib/store"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-muted text-muted-foreground",
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

function CustomerRequestsContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  const { currentUser, requests, chatRooms } = useGiftraStore()

  if (!currentUser) return null

  const myRequests = requests
    .filter(r => r.customerId === currentUser.id)
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => 
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">View and manage all your gift requests</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
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
            <Filter className="w-4 h-4 mr-2" />
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
          {myRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No requests found</p>
              <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myRequests.map((request) => {
                const chatRoom = chatRooms.find(c => c.requestId === request.id)
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{request.category}</h3>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                        <span>
                          Budget: ${request.budgetMin} - ${request.budgetMax}
                        </span>
                        {request.adminPrice && (
                          <span className="text-primary font-medium">
                            Final: ${request.adminPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {chatRoom && !chatRoom.isLocked && (
                        <Link href={`/chat/${chatRoom.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Chat
                          </Button>
                        </Link>
                      )}
                      <Link href={`/customer/request/${request.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default function CustomerRequestsPage() {
  return (
    <DashboardLayout>
      <CustomerRequestsContent />
    </DashboardLayout>
  )
}
