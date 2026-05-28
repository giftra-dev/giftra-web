"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  MessageSquare, 
  Clock,
  User,
  Search,
  DollarSign,
  CheckCircle,
  Upload,
  Truck
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { getArtistOrders, updateOrderStatus, getChatRoomByRequestId } from "@/lib/supabase/queries"
import type { OrderStatus } from "@/lib/types/database"

const orderStatusColors: Record<OrderStatus, string> = {
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

const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting Payment",
  paid: "Paid",
  in_progress: "In Progress",
  preview_shared: "Preview Shared",
  revision_requested: "Revision Requested",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  refunded: "Refunded",
}

interface OrderWithDetails {
  id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  platform_fee: number
  total: number
  created_at: string
  updated_at: string
  request: {
    id: string
    title: string
    description: string
    category: string
    deadline: string | null
  }
  customer: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  chat_room_id?: string | null
}

function ArtistOrdersContent() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [updating, setUpdating] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    
    const ordersData = await getArtistOrders(user.id)
    
    const ordersWithChat = await Promise.all(
      ordersData.map(async (order) => {
        const chatRoom = await getChatRoomByRequestId(order.request_id)
        return {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          subtotal: order.subtotal,
          platform_fee: order.platform_fee,
          total: order.total,
          created_at: order.created_at,
          updated_at: order.updated_at,
          request: order.request,
          customer: order.customer,
          chat_room_id: chatRoom?.id || null
        }
      })
    )
    setOrders(ordersWithChat as OrderWithDetails[])
    setLoading(false)
  }

  const handleStatusUpdate = async (order: OrderWithDetails, newStatus: OrderStatus) => {
    if (newStatus === "shipped") {
      setSelectedOrder(order)
      setUpdateDialogOpen(true)
      return
    }
    
    setUpdating(true)
    await updateOrderStatus(order.id, newStatus)
    await loadOrders()
    setUpdating(false)
  }

  const handleShipOrder = async () => {
    if (!selectedOrder) return
    setUpdating(true)
    await updateOrderStatus(selectedOrder.id, "shipped", {
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
    })
    setUpdateDialogOpen(false)
    setSelectedOrder(null)
    setTrackingNumber("")
    await loadOrders()
    setUpdating(false)
  }

  const activeOrders = orders.filter(o => 
    ["paid", "in_progress", "preview_shared", "revision_requested"].includes(o.status)
  )
  
  const completedOrders = orders.filter(o => 
    ["ready_to_ship", "shipped", "delivered", "completed"].includes(o.status)
  )

  const filteredActive = activeOrders.filter(o =>
    o.request.title.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCompleted = completedOrders.filter(o =>
    o.request.title.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate earnings (80% of total)
  const totalEarnings = orders
    .filter(o => ["completed", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + (o.total * 0.8), 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">Manage orders assigned to you</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold text-foreground">{activeOrders.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              {filteredActive.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active orders</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredActive.map((order) => (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-medium text-foreground">{order.request.title}</h3>
                              <Badge variant="outline" className={orderStatusColors[order.status]}>
                                {orderStatusLabels[order.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-lg">
                              {order.request.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {order.customer.full_name || order.customer.email}
                              </span>
                              {order.request.deadline && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {new Date(order.request.deadline).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-primary font-medium">
                                ${(order.total * 0.8).toFixed(0)} earnings
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {order.chat_room_id && (
                            <Button asChild size="sm" className="w-full gap-1">
                              <Link href={`/chat/${order.chat_room_id}`}>
                                <MessageSquare className="w-4 h-4" />
                                Chat
                              </Link>
                            </Button>
                          )}
                          {order.status === "paid" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(order, "in_progress")}
                              disabled={updating}
                            >
                              Start Work
                            </Button>
                          )}
                          {order.status === "in_progress" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(order, "preview_shared")}
                              disabled={updating}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Share Preview
                            </Button>
                          )}
                          {(order.status === "preview_shared" || order.status === "revision_requested") && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(order, "ready_to_ship")}
                              disabled={updating}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              {filteredCompleted.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredCompleted.map((order) => (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-success" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-medium text-foreground">{order.request.title}</h3>
                              <Badge variant="outline" className={orderStatusColors[order.status]}>
                                {orderStatusLabels[order.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {order.customer.full_name || order.customer.email}
                              </span>
                              <span>Order #{order.order_number}</span>
                              <span className="text-success font-medium">
                                +${(order.total * 0.8).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {order.status === "ready_to_ship" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order, "shipped")}
                              disabled={updating}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Ship Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shipping Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
            <DialogDescription>
              Enter the tracking number for this shipment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Tracking Number</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShipOrder} disabled={!trackingNumber || updating}>
              {updating ? "Shipping..." : "Confirm Shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
