"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  MessageSquare, 
  Users,
  DollarSign,
  ArrowRight,
  Clock,
  AlertTriangle
} from "lucide-react"
import { 
  getAllRequests,
  getAllOrders,
  getAllChatRooms,
  getAdminStats,
} from "@/lib/supabase/queries"
import type { RequestWithRelations, OrderWithRelations, ChatRoomWithRelations } from "@/lib/types/database"
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

function AdminDashboardContent() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalArtists: 0,
    totalCustomers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [requestsData, ordersData, chatsData, statsData] = await Promise.all([
        getAllRequests(),
        getAllOrders(),
        getAllChatRooms(),
        getAdminStats(),
      ])

      setRequests(requestsData)
      setOrders(ordersData)
      setChatRooms(chatsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingRequests = requests.filter(r => r.status === 'pending_review')

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage requests, orders, and monitor the platform</p>
      </div>

      {/* Alert for pending requests */}
      {pendingRequests.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-5 h-5 text-warning-foreground" />
          <div className="flex-1">
            <p className="font-medium text-warning-foreground">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting review
            </p>
            <p className="text-sm text-warning-foreground/80">
              Assign artists and set pricing to proceed
            </p>
          </div>
          <Link href="/admin/requests">
            <Button size="sm" variant="outline">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Needs assignment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalArtists} artists, {stats.totalCustomers} customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              15% platform fee
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Latest gift requests from customers</CardDescription>
            </div>
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {request.title || CATEGORY_LABELS[request.category] || request.category}
                        </span>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {REQUEST_STATUS_LABELS[request.status] || request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.customer?.full_name || 'Unknown'} - ${request.budget_min}-${request.budget_max}
                      </p>
                    </div>
                    <Link href="/admin/requests">
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Chats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Chats</CardTitle>
              <CardDescription>Monitor ongoing conversations</CardDescription>
            </div>
            <Link href="/admin/chats">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {chatRooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active chats</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatRooms.slice(0, 5).map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {chat.request?.title || (chat.request?.category && CATEGORY_LABELS[chat.request.category as keyof typeof CATEGORY_LABELS]) || 'Chat'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chat.customer?.full_name || 'Customer'} - {chat.artist?.full_name || 'Artist'}
                      </p>
                    </div>
                    <Link href={`/chat/${chat.id}`}>
                      <Button size="sm" variant="ghost">Monitor</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <AdminDashboardContent />
    </DashboardLayout>
  )
}
