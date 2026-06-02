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
  DollarSign,
  ArrowRight,
  Clock,
  Star
} from "lucide-react"
import { 
  getCurrentUser,
  getArtistOrders, 
  getArtistStats,
  getUserChatRooms,
} from "@/lib/supabase/queries"
import type { OrderWithRelations, ChatRoomWithRelations } from "@/lib/types/database"
import { ORDER_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types/database"

const orderStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  awaiting_payment: "bg-warning/20 text-warning-foreground",
  paid: "bg-success/20 text-success-foreground",
  in_progress: "bg-primary/20 text-primary",
  preview_shared: "bg-info/20 text-info-foreground",
  revision_requested: "bg-accent text-accent-foreground",
  ready_to_ship: "bg-success/20 text-success-foreground",
  shipped: "bg-success/20 text-success-foreground",
  delivered: "bg-success/20 text-success-foreground",
  completed: "bg-success/20 text-success-foreground",
  refunded: "bg-destructive/20 text-destructive-foreground",
}

function ArtistDashboardContent() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingMessages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) return

      const [ordersData, statsData, chatsData] = await Promise.all([
        getArtistOrders(user.id),
        getArtistStats(user.id),
        getUserChatRooms(user.id, 'artist'),
      ])

      setOrders(ordersData)
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

  const activeOrders = orders.filter(o => !['completed', 'refunded', 'delivered'].includes(o.status))

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
        <h1 className="text-2xl font-bold">Artist Dashboard</h1>
        <p className="text-muted-foreground">Manage your orders and collaborate with customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently working on
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
              Total Earned
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Orders that need your attention</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/artist/orders">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active orders</p>
              <p className="text-sm text-muted-foreground mt-1">
                New orders will appear here when assigned by admin
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.slice(0, 5).map((order) => {
                const chatRoom = chatRooms.find(c => c.request_id === order.request_id)

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">
                          {order.request?.title || (order.request?.category && CATEGORY_LABELS[order.request.category]) || 'Order'}
                        </h3>
                        <Badge variant="outline" className={orderStatusColors[order.status]}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.request?.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Customer: {order.customer?.full_name || 'Unknown'}</span>
                        {order.request?.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(order.request.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-primary font-medium">
                          ${order.subtotal}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {chatRoom && (
                        <Button asChild size="sm" variant="outline" className="gap-1">
                          <Link href={`/chat/${chatRoom.id}`}>
                            <MessageSquare className="w-4 h-4" />
                            Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ArtistDashboardPage() {
  return (
    <DashboardLayout>
      <ArtistDashboardContent />
    </DashboardLayout>
  )
}
