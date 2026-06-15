"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Search,
  MessageSquare,
  Calendar,
  Filter
} from "lucide-react"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCustomerRequests, getChatRoomByRequestId, getCurrentUser } from "@/lib/supabase/queries"
import type { RequestStatus } from "@/lib/types/database"

const statusColors: Record<RequestStatus, string> = {
  pending_review: "bg-muted text-muted-foreground",
  approved: "bg-warning/20 text-warning-foreground border-warning/30",
  assigned: "bg-info/20 text-info-foreground border-info/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  delivered: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
  rejected: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

const statusLabels: Record<RequestStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  assigned: "Artist Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
}

interface RequestWithChat {
  id: string
  title: string
  description: string
  category: string
  status: RequestStatus
  deadline: string | null
  budget_min: number | null
  budget_max: number | null
  final_price: number | null
  created_at: string
  chat_room_id?: string | null
}

function CustomerRequestsContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [requests, setRequests] = useState<RequestWithChat[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadData() {
      const { user } = await getCurrentUser()
      if (!user) {
        setLoading(false)
        return
      }
      
      setUserId(user.id)
      
      const requestsData = await getCustomerRequests(user.id)
      
      // Load chat rooms for each request
      const requestsWithChat = await Promise.all(
        requestsData.map(async (req) => {
          const chatRoom = await getChatRoomByRequestId(req.id)
          return {
            ...req,
            chat_room_id: chatRoom?.id || null
          }
        })
      )
      setRequests(requestsWithChat as RequestWithChat[])
      setLoading(false)
    }
    
    loadData()
  }, [])

  const filteredRequests = requests
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleRequestCreated = async () => {
    if (!userId) return
    const requestsData = await getCustomerRequests(userId)
    const requestsWithChat = await Promise.all(
      requestsData.map(async (req) => {
        const chatRoom = await getChatRoomByRequestId(req.id)
        return {
          ...req,
          chat_room_id: chatRoom?.id || null
        }
      })
    )
    setRequests(requestsWithChat as RequestWithChat[])
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
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
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="assigned">Artist Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No requests found</p>
              <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground">{request.title}</h3>
                      <Badge variant="outline" className={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{request.category.replace(/_/g, ' ')}</span>
                      {request.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {request.budget_min && request.budget_max && (
                        <span>
                          Budget: ${request.budget_min} - ${request.budget_max}
                        </span>
                      )}
                      {request.final_price && (
                        <span className="text-primary font-medium">
                          Final: ${request.final_price}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {request.chat_room_id && (
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <Link href={`/customer/request/${request.id}`}>
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/customer/request/${request.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRequestDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={handleRequestCreated}
      />
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
