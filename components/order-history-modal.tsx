"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { getCustomerOrders } from "@/lib/supabase/queries"
import type { OrderWithRelations, OrderStatus } from "@/lib/types/database"
import { ORDER_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types/database"
import Link from "next/link"

interface OrderHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

const statusConfig: Record<OrderStatus, { color: string; icon: React.ElementType }> = {
  draft: { color: "bg-muted text-muted-foreground", icon: Clock },
  awaiting_payment: { color: "bg-warning/20 text-warning-foreground border-warning/30", icon: AlertCircle },
  paid: { color: "bg-info/20 text-info-foreground border-info/30", icon: CheckCircle },
  in_progress: { color: "bg-primary/20 text-primary border-primary/30", icon: Package },
  preview_shared: { color: "bg-info/20 text-info-foreground border-info/30", icon: Package },
  revision_requested: { color: "bg-warning/20 text-warning-foreground border-warning/30", icon: AlertCircle },
  ready_to_ship: { color: "bg-info/20 text-info-foreground border-info/30", icon: Truck },
  shipped: { color: "bg-info/20 text-info-foreground border-info/30", icon: Truck },
  delivered: { color: "bg-success/20 text-success-foreground border-success/30", icon: CheckCircle },
  completed: { color: "bg-success/20 text-success-foreground border-success/30", icon: CheckCircle },
  refunded: { color: "bg-destructive/20 text-destructive-foreground border-destructive/30", icon: AlertCircle },
}

export function OrderHistoryModal({ open, onOpenChange, userId }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const data = await getCustomerOrders(userId)
      setOrders(data)
    } catch (error) {
      console.error("[v0] Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (open && userId) {
      loadOrders()
    }
  }, [open, userId, loadOrders])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order History
          </DialogTitle>
          <DialogDescription>
            View your past orders and track their status
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-lg mb-1">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your order history will appear here once you make your first purchase
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
                <Link href="/customer/dashboard">
                  Browse Requests
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">
                            Order #{order.order_number}
                          </h3>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        
                        {order.request && (
                          <p className="text-sm text-muted-foreground truncate">
                            {order.request.title || CATEGORY_LABELS[order.request.category as keyof typeof CATEGORY_LABELS] || "Custom Gift"}
                          </p>
                        )}

                        {order.artist && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Artist: {order.artist.full_name || "Unknown Artist"}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ordered: {formatDate(order.created_at)}
                      </span>
                      
                      {order.paid_at && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Paid: {formatDate(order.paid_at)}
                        </span>
                      )}

                      {order.shipped_at && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Shipped: {formatDate(order.shipped_at)}
                        </span>
                      )}

                      {order.delivered_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Delivered: {formatDate(order.delivered_at)}
                        </span>
                      )}
                    </div>

                    {order.tracking_number && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Tracking:</span>{" "}
                        {order.tracking_number}
                      </div>
                    )}

                    {order.request && (
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          asChild
                        >
                          <Link href={`/customer/request/${order.request.id}`}>
                            View Details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
