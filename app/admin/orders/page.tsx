"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllChatRooms, getAllOrders, updateOrderStatus } from "@/lib/supabase/queries"
import type { ChatRoomWithRelations, OrderStatus, OrderWithRelations } from "@/lib/types/database"
import { ORDER_STATUS_LABELS } from "@/lib/types/database"
import { Clock, MessageSquare, Package, Search, Truck, User } from "lucide-react"

const orderStatusColors: Record<OrderStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  awaiting_payment: "bg-warning/20 text-warning-foreground border-warning/30",
  paid: "bg-success/20 text-success-foreground border-success/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  preview_shared: "bg-info/20 text-info-foreground border-info/30",
  revision_requested: "bg-accent text-accent-foreground",
  ready_to_ship: "bg-success/20 text-success-foreground border-success/30",
  shipped: "bg-success/20 text-success-foreground border-success/30",
  delivered: "bg-success/20 text-success-foreground border-success/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  refunded: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

const editableStatuses: OrderStatus[] = [
  "awaiting_payment",
  "paid",
  "in_progress",
  "preview_shared",
  "revision_requested",
  "ready_to_ship",
  "shipped",
  "delivered",
  "completed",
  "refunded",
]

function AdminOrdersContent() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [ordersData, chatsData] = await Promise.all([getAllOrders(), getAllChatRooms()])
      setOrders(ordersData)
      setChatRooms(chatsData)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredOrders = orders.filter((order) => {
    const searchText = [
      order.order_number,
      order.request?.title,
      order.customer?.full_name,
      order.customer?.email,
      order.artist?.full_name,
      order.artist?.email,
      order.status,
    ].join(" ").toLowerCase()

    return (statusFilter === "all" || order.status === statusFilter) && searchText.includes(search.toLowerCase())
  })

  const handleStatusChange = async (order: OrderWithRelations, status: OrderStatus) => {
    setUpdatingOrderId(order.id)
    const additionalFields =
      status === "delivered"
        ? { delivered_at: new Date().toISOString() }
        : status === "shipped" && !order.shipped_at
          ? { shipped_at: new Date().toISOString() }
          : undefined

    const { data, error } = await updateOrderStatus(order.id, status, additionalFields)
    if (error) {
      console.error("Error updating order:", error)
    } else if (data) {
      await loadData()
    }
    setUpdatingOrderId(null)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">All Orders</h1>
          <p className="text-muted-foreground">Monitor and manage every order on the platform</p>
        </div>

        <div className="grid sm:grid-cols-[1fr_220px] gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {editableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const chatRoom = chatRooms.find((chat) => chat.request_id === order.request_id)
                  return (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h3 className="font-medium">{order.request?.title || `Order ${order.order_number}`}</h3>
                              <Badge variant="outline" className={orderStatusColors[order.status]}>
                                {ORDER_STATUS_LABELS[order.status]}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span>#{order.order_number}</span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {order.customer?.full_name || order.customer?.email || "Customer"} to{" "}
                                {order.artist?.full_name || order.artist?.email || "Artist"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(order.updated_at).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-primary">${order.total.toFixed(2)}</span>
                              {order.tracking_number && (
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {order.tracking_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order, value as OrderStatus)}
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger className="w-[190px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {editableStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {ORDER_STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminOrdersPage() {
  return <AdminOrdersContent />
}
