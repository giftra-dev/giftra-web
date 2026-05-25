"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Clock,
  CreditCard,
  CheckCircle
} from "lucide-react"
import { useGiftraStore, type RequestStatus } from "@/lib/store"

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  admin_review: "bg-warning/20 text-warning-foreground border-warning/30",
  artist_assigned: "bg-info/20 text-info-foreground border-info/30",
  awaiting_payment: "bg-accent text-accent-foreground",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

const statusLabels: Record<RequestStatus, string> = {
  pending: "Pending Review",
  admin_review: "Under Admin Review",
  artist_assigned: "Artist Assigned",
  awaiting_payment: "Awaiting Payment",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

function RequestDetailContent({ requestId }: { requestId: string }) {
  const router = useRouter()
  const { 
    getRequestById, 
    getChatRoomByRequestId, 
    getOrderByRequestId,
    artistProfiles,
    createOrder 
  } = useGiftraStore()

  const request = getRequestById(requestId)
  const chatRoom = getChatRoomByRequestId(requestId)
  const order = getOrderByRequestId(requestId)
  const artist = request?.assignedArtistId 
    ? artistProfiles.find(a => a.id === request.assignedArtistId)
    : null

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Request not found</p>
          <Link href="/customer/requests">
            <Button variant="outline">Back to Requests</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePayment = () => {
    createOrder(requestId)
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer/requests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{request.category}</h1>
            <Badge variant="outline" className={statusColors[request.status]}>
              {statusLabels[request.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-foreground">{request.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget Range</h4>
                  <p className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${request.budgetMin} - ${request.budgetMax}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h4>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(request.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artist Info */}
          {artist && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Artist</CardTitle>
                <CardDescription>Your request has been matched with this artist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{artist.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialties.map((spec) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Rating: {artist.rating}/5</span>
                      <span>{artist.completedOrders} orders completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Info */}
          {order && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      Total paid: ${order.paidAmount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{statusLabels[request.status]}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === "pending" && "Waiting for admin review"}
                    {request.status === "admin_review" && "Admin is reviewing your request"}
                    {request.status === "artist_assigned" && "Pay to start production"}
                    {request.status === "in_progress" && "Artist is working on your gift"}
                    {request.status === "completed" && "Your gift is ready!"}
                  </p>
                </div>
              </div>

              {/* Payment CTA */}
              {request.status === "artist_assigned" && request.adminPrice && !order && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Final Price</span>
                      <span className="text-2xl font-bold text-primary">${request.adminPrice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pay to unlock chat and start production
                    </p>
                    <Button className="w-full gap-2" onClick={handlePayment}>
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat CTA */}
              {chatRoom && !chatRoom.isLocked && (
                <Link href={`/chat/${chatRoom.id}`}>
                  <Button className="w-full gap-2" variant="outline">
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </Button>
                </Link>
              )}

              {chatRoom?.isLocked && (
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">
                    {chatRoom.lockReason || "Chat is locked"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CustomerRequestPage({ 
  params 
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
