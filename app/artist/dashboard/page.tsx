"use client"

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
import { useGiftraStore, type OrderStatus } from "@/lib/store"

const orderStatusColors: Record<OrderStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  awaiting_payment: "bg-warning/20 text-warning-foreground",
  in_progress: "bg-primary/20 text-primary",
  preview_shared: "bg-info/20 text-info-foreground",
  revision_requested: "bg-accent text-accent-foreground",
  ready_to_ship: "bg-success/20 text-success-foreground",
  shipped: "bg-success/20 text-success-foreground",
  delivered: "bg-success/20 text-success-foreground",
  completed: "bg-success/20 text-success-foreground",
  refunded: "bg-destructive/20 text-destructive-foreground",
}

const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting Payment",
  in_progress: "In Progress",
  preview_shared: "Preview Shared",
  revision_requested: "Revision Requested",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  refunded: "Refunded",
}

function ArtistDashboardContent() {
  const { currentUser, orders, requests, chatRooms, users } = useGiftraStore()

  if (!currentUser) return null

  const myOrders = orders.filter(o => o.artistId === currentUser.id)
  const activeOrders = myOrders.filter(o => !["completed", "refunded", "delivered"].includes(o.status))
  const myChats = chatRooms.filter(c => c.artistId === currentUser.id && !c.isLocked)
  
  // Calculate earnings
  const totalEarnings = myOrders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount * 0.8, 0) // 80% goes to artist
  
  const pendingEarnings = myOrders
    .filter(o => ["in_progress", "preview_shared", "ready_to_ship", "shipped", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount * 0.8, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {currentUser.name.split(" ")[0]}!</h1>
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
            <div className="text-2xl font-bold">{activeOrders.length}</div>
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
            <div className="text-2xl font-bold">{myChats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Earnings
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From active orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed orders
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
          <Link href="/artist/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
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
              {activeOrders.map((order) => {
                const request = requests.find(r => r.id === order.requestId)
                const customer = users.find(u => u.id === order.customerId)
                const chatRoom = chatRooms.find(c => c.orderId === order.id)

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{request?.category}</h3>
                        <Badge variant="outline" className={orderStatusColors[order.status]}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {request?.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Customer: {customer?.name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {request && new Date(request.deadline).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-medium">
                          ${order.totalAmount}
                        </span>
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
