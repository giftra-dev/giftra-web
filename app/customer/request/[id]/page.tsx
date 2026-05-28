"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  MessageSquare,
  Package,
  Star,
  User,
} from "lucide-react"
import {
  createOrder,
  createReview,
  getChatRoomByRequestId,
  getCurrentUser,
  getCustomerOrderByRequestId,
  getRequest,
  updateOrderAndRequestStatus,
  updateOrderStatus,
} from "@/lib/supabase/queries"
import type { ChatRoom, OrderWithRelations, RequestWithRelations } from "@/lib/types/database"
import { CATEGORY_LABELS, ORDER_STATUS_LABELS, REQUEST_STATUS_LABELS } from "@/lib/types/database"

const mockPaymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS === "true"

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

function RequestDetailContent({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<RequestWithRelations | null>(null)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [order, setOrder] = useState<OrderWithRelations | null>(null)
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState("5")
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        setError("Please sign in to view this request.")
        return
      }

      const [requestData, chatRoomData, orderData] = await Promise.all([
        getRequest(requestId),
        getChatRoomByRequestId(requestId),
        getCustomerOrderByRequestId(requestId, user.id),
      ])

      setUserId(user.id)
      setRequest(requestData)
      setChatRoom(chatRoomData)
      setOrder(orderData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load request.")
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePayment = async () => {
    if (!request) return
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      if (!mockPaymentsEnabled) {
        const { data, error: orderError } = await createOrder(request.id)
        if (orderError) throw orderError
        if (data) {
          setMessage("Order created. Connect a payment provider to collect payment and unlock chat.")
        }
        await loadData()
        return
      }

      const { error: orderError } = await createOrder(request.id, `mock_${Date.now()}`)
      if (orderError) throw orderError
      setMessage("Mock payment completed. Chat is now unlocked.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveDesign = async () => {
    if (!order || !request) return
    setIsSubmitting(true)
    await updateOrderStatus(order.id, "ready_to_ship")
    await loadData()
    setIsSubmitting(false)
  }

  const handleRequestRevision = async () => {
    if (!order) return
    setIsSubmitting(true)
    await updateOrderStatus(order.id, "revision_requested")
    await loadData()
    setIsSubmitting(false)
  }

  const handleMarkDelivered = async () => {
    if (!order || !request) return
    setIsSubmitting(true)
    await updateOrderAndRequestStatus(order.id, request.id, "delivered", "delivered", {
      delivered_at: new Date().toISOString(),
    })
    await loadData()
    setIsSubmitting(false)
  }

  const handleSubmitReview = async () => {
    if (!order || !request) return
    setIsSubmitting(true)
    setError("")

    const { error: reviewError } = await createReview(
      order.id,
      Number.parseInt(rating, 10),
      reviewTitle || undefined,
      reviewContent || undefined
    )

    if (reviewError) {
      setError(reviewError.message)
    } else {
      await updateOrderAndRequestStatus(order.id, request.id, "completed", "completed")
      setReviewOpen(false)
      setMessage("Review submitted. Thanks for closing the loop.")
      await loadData()
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error || "Request not found"}</p>
          <Button asChild variant="outline">
            <Link href="/customer/requests">Back to Requests</Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = request.quoted_price || 0
  const platformFee = Math.round(subtotal * 0.15 * 100) / 100
  const total = subtotal + platformFee
  const canPay = request.status === "assigned" && request.quoted_price && !order
  const canReview = order?.status === "delivered" && !order.review

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/customer/requests">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{request.title}</h1>
            <Badge variant="outline" className={statusColors[request.status]}>
              {REQUEST_STATUS_LABELS[request.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p>{request.description}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                  <p>{CATEGORY_LABELS[request.category]}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget</h4>
                  <p className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${request.budget_min || 0} - ${request.budget_max || 0}
                  </p>
                </div>
                {request.deadline && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h4>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {request.occasion && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Occasion</h4>
                    <p>{request.occasion}</p>
                  </div>
                )}
              </div>
              {request.reference_images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">References</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {request.reference_images.map((image) => (
                      <a key={image} href={image} target="_blank" rel="noreferrer" className="block">
                        <img src={image} alt="" className="aspect-square w-full rounded-lg object-cover border" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {request.assigned_artist && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Artist</CardTitle>
                <CardDescription>Your request has been matched with this artist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {request.assigned_artist.avatar_url ? (
                      <img src={request.assigned_artist.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.assigned_artist.full_name || "Artist"}</h3>
                    {request.assigned_artist.bio && (
                      <p className="text-sm text-muted-foreground mb-2">{request.assigned_artist.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(request.assigned_artist.specialties || []).map((specialty) => (
                        <Badge key={specialty} variant="secondary">{CATEGORY_LABELS[specialty]}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {order && (
            <Card>
              <CardHeader>
                <CardTitle>Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {ORDER_STATUS_LABELS[order.status]} - ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                {order.status === "preview_shared" && (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleApproveDesign} disabled={isSubmitting}>
                      Approve Design
                    </Button>
                    <Button variant="outline" onClick={handleRequestRevision} disabled={isSubmitting}>
                      Request Revision
                    </Button>
                  </div>
                )}
                {order.status === "shipped" && (
                  <Button onClick={handleMarkDelivered} disabled={isSubmitting}>
                    Mark Delivered
                  </Button>
                )}
                {canReview && (
                  <Button onClick={() => setReviewOpen(true)} className="gap-2">
                    <Star className="w-4 h-4" />
                    Leave Review
                  </Button>
                )}
                {order.review && (
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">Your review</p>
                    <p className="text-sm text-muted-foreground">{order.review.rating}/5 stars</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{REQUEST_STATUS_LABELS[request.status]}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === "pending_review" && "Waiting for admin review"}
                    {request.status === "assigned" && "Ready for payment"}
                    {request.status === "in_progress" && "Artist is working on your gift"}
                    {request.status === "delivered" && "Confirm and review your order"}
                    {request.status === "completed" && "Order completed"}
                  </p>
                </div>
              </div>

              {canPay && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform fee</span>
                      <span>${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    {!mockPaymentsEnabled && (
                      <p className="text-xs text-muted-foreground">
                        Payment provider is not configured yet. This will create an unpaid order.
                      </p>
                    )}
                    <Button className="w-full gap-2" onClick={handlePayment} disabled={isSubmitting}>
                      <CreditCard className="w-4 h-4" />
                      {mockPaymentsEnabled ? "Pay with Mock Payment" : "Create Payment Order"}
                    </Button>
                  </div>
                </div>
              )}

              {chatRoom && order && !["awaiting_payment", "draft"].includes(order.status) && (
                <Button asChild className="w-full gap-2" variant="outline">
                  <Link href={`/chat/${chatRoom.id}`}>
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>Share feedback about your custom gift experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(event) => setRating(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewTitle">Title</Label>
              <Input id="reviewTitle" value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewContent">Review</Label>
              <Textarea
                id="reviewContent"
                rows={4}
                value={reviewContent}
                onChange={(event) => setReviewContent(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CustomerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <DashboardLayout>
      <RequestDetailContent requestId={id} />
    </DashboardLayout>
  )
}
