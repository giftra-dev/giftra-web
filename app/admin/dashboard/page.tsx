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
  AlertTriangle,
  Images,
  LifeBuoy,
  CreditCard,
  PauseCircle,
} from "lucide-react"
import { 
  getAllRequests,
  getAllOrders,
  getAllChatRooms,
  getAdminStats,
  getAllArtworksForAdmin,
  getAllSupportConversations,
} from "@/lib/supabase/queries"
import type { ArtistArtwork, RequestWithRelations, OrderWithRelations, ChatRoomWithRelations, SupportConversationWithRelations } from "@/lib/types/database"
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
  const [artworks, setArtworks] = useState<Array<ArtistArtwork & { artist?: { id: string; email: string; full_name: string | null } }>>([])
  const [supportConversations, setSupportConversations] = useState<SupportConversationWithRelations[]>([])
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalArtists: 0,
    totalCustomers: 0,
    pendingArtworks: 0,
    openSupportConversations: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [requestsData, ordersData, chatsData, statsData, artworksData, supportData] = await Promise.all([
        getAllRequests(),
        getAllOrders(),
        getAllChatRooms(),
        getAdminStats(),
        getAllArtworksForAdmin(),
        getAllSupportConversations(),
      ])

      setRequests(requestsData)
      setOrders(ordersData)
      setChatRooms(chatsData)
      setStats(statsData)
      setArtworks(artworksData)
      setSupportConversations(supportData)
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
  const pendingArtworks = artworks.filter((artwork) => artwork.approval_status === "pending")
  const awaitingPaymentOrders = orders.filter((order) => order.status === "awaiting_payment")
  const activeProductionOrders = orders.filter((order) => ["paid", "in_progress", "preview_shared", "revision_requested", "ready_to_ship"].includes(order.status))
  const moderatedChats = chatRooms.filter((chat) => chat.moderation_status !== "active")
  const openSupport = supportConversations.filter((conversation) => conversation.status === "open")
  const requestIdsWithOrders = new Set(orders.map((order) => order.request_id))
  const quotedRequestsWithoutPayment = requests.filter((request) =>
    request.status === "assigned" &&
    Boolean(request.quoted_price) &&
    !requestIdsWithOrders.has(request.id)
  )
  const operationQueues = [
    {
      title: "Review requests",
      description: "New gift briefs waiting for admin review.",
      count: pendingRequests.length,
      icon: AlertTriangle,
      href: "/admin/requests",
      tone: "text-warning-foreground",
    },
    {
      title: "Approve artwork",
      description: "Portfolio samples waiting to go live.",
      count: pendingArtworks.length,
      icon: Images,
      href: "/admin/artworks",
      tone: "text-primary",
    },
    {
      title: "Quotes awaiting payment",
      description: "Customers have a final price but no order yet.",
      count: quotedRequestsWithoutPayment.length + awaitingPaymentOrders.length,
      icon: CreditCard,
      href: "/admin/orders",
      tone: "text-info",
    },
    {
      title: "Moderated chats",
      description: "Paused or ended customer-artist conversations.",
      count: moderatedChats.length,
      icon: PauseCircle,
      href: "/admin/chats",
      tone: "text-destructive",
    },
    {
      title: "Support inbox",
      description: "Open customer conversations with Giftra.",
      count: openSupport.length,
      icon: LifeBuoy,
      href: "/admin/support",
      tone: "text-success",
    },
    {
      title: "Active production",
      description: "Paid orders currently being worked on.",
      count: activeProductionOrders.length,
      icon: Package,
      href: "/admin/orders",
      tone: "text-primary",
    },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Artwork Review
            </CardTitle>
            <Images className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingArtworks}</div>
            <Link href="/admin/artworks" className="mt-1 block text-xs text-primary hover:underline">
              Pending approvals
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Support
            </CardTitle>
            <LifeBuoy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openSupportConversations}</div>
            <Link href="/admin/support" className="mt-1 block text-xs text-primary hover:underline">
              Open conversations
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operations Queue</CardTitle>
          <CardDescription>Daily admin work across requests, artists, chats, payments, and support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operationQueues.map((queue) => {
              const Icon = queue.icon
              return (
                <Link
                  key={queue.title}
                  href={queue.href}
                  className="rounded-lg border p-4 transition hover:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{queue.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{queue.description}</p>
                    </div>
                    <Icon className={`h-5 w-5 ${queue.tone}`} />
                  </div>
                  <p className="mt-4 text-3xl font-bold">{queue.count}</p>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid xl:grid-cols-3 gap-6">
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

        {/* Pending Artwork */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Artwork Approvals</CardTitle>
              <CardDescription>Portfolio samples waiting for review</CardDescription>
            </div>
            <Link href="/admin/artworks">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingArtworks.length === 0 ? (
              <div className="text-center py-8">
                <Images className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No artwork waiting for approval</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingArtworks.slice(0, 5).map((artwork) => (
                  <div key={artwork.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <img src={artwork.image_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{artwork.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {artwork.artist?.full_name || artwork.artist?.email || "Artist"} - {CATEGORY_LABELS[artwork.category]}
                      </p>
                    </div>
                    <Link href="/admin/artworks">
                      <Button size="sm" variant="ghost">Review</Button>
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
                    <Link href="/admin/orders">
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
