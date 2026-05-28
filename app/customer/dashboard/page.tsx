"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Package, 
  MessageSquare, 
  Clock,
  ArrowRight,
  Calendar
} from "lucide-react"
import { CreateRequestDialog } from "@/components/create-request-dialog"
import { 
  getCurrentUser,
  getCustomerRequests, 
  getCustomerStats,
  getUserChatRooms,
  getChatRoomByRequest
} from "@/lib/supabase/queries"
import type { RequestWithRelations, ChatRoomWithRelations } from "@/lib/types/database"
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

function CustomerDashboardContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [stats, setStats] = useState({ totalRequests: 0, activeRequests: 0, completedOrders: 0, pendingMessages: 0 })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) return

      setCurrentUserId(user.id)

      const [requestsData, statsData, chatsData] = await Promise.all([
        getCustomerRequests(user.id),
        getCustomerStats(user.id),
        getUserChatRooms(user.id, 'customer'),
      ])

      setRequests(requestsData)
      setStats(statsData)
      setChatRooms(chatsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRequestCreated = () => {
    setCreateOpen(false)
    loadData()
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Giftra!</h1>
          <p className="text-muted-foreground">Manage your gift requests and collaborations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Requests
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRequests} total requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Chats
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatRooms.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest gift requests and their status</CardDescription>
          </div>
          <Link href="/customer/requests">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No requests yet</p>
              <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice(0, 5).map((request) => {
                const chatRoom = chatRooms.find(c => c.request_id === request.id)
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium truncate">
                          {request.title || CATEGORY_LABELS[request.category] || request.category}
                        </h3>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {REQUEST_STATUS_LABELS[request.status] || request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                        {request.assigned_artist && (
                          <span className="text-primary">
                            Artist: {request.assigned_artist.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {chatRoom && (
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

      <CreateRequestDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={handleRequestCreated}
      />
    </div>
  )
}

export default function CustomerDashboardPage() {
  return (
    <DashboardLayout>
      <CustomerDashboardContent />
    </DashboardLayout>
  )
}
