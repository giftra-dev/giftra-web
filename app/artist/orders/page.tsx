"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  MessageSquare, 
  Clock,
  User
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

function ArtistOrdersContent() {
  const { currentUser, orders, requests, chatRooms, users } = useGiftraStore()

  if (!currentUser) return null

  const myOrders = orders
    .filter(o => o.artistId === currentUser.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">All orders assigned to you</p>
      </div>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {myOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Orders will appear here when assigned by admin
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myOrders.map((order) => {
                const request = requests.find(r => r.id === order.requestId)
                const customer = users.find(u => u.id === order.customerId)
                const chatRoom = chatRooms.find(c => c.orderId === order.id)

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{request?.category}</h3>
                          <Badge variant="outline" className={orderStatusColors[order.status]}>
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {request?.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {customer?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {request && new Date(request.deadline).toLocaleDateString()}
                          </span>
                          <span className="text-primary font-medium">
                            ${(order.totalAmount * 0.8).toFixed(0)} earnings
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {chatRoom && !chatRoom.isLocked && (
                        <Link href={`/chat/${chatRoom.id}`}>
                          <Button size="sm" className="gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Open Chat
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

export default function ArtistOrdersPage() {
  return (
    <DashboardLayout>
      <ArtistOrdersContent />
    </DashboardLayout>
  )
}
