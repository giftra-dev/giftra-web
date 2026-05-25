"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Package, 
  MessageSquare, 
  Clock,
  ArrowRight,
  Calendar
} from "lucide-react"
import { useGiftraStore, type RequestStatus } from "@/lib/store"
import { CreateRequestDialog } from "@/components/create-request-dialog"

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
  pending: "Pending",
  admin_review: "Under Review",
  artist_assigned: "Artist Assigned",
  awaiting_payment: "Awaiting Payment",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

function CustomerDashboardContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const { currentUser, requests, chatRooms, orders } = useGiftraStore()

  if (!currentUser) return null

  const myRequests = requests.filter(r => r.customerId === currentUser.id)
  const activeRequests = myRequests.filter(r => !["completed", "cancelled"].includes(r.status))
  const myChats = chatRooms.filter(c => c.customerId === currentUser.id)
  const unreadChats = myChats.filter(c => !c.isLocked).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentUser.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Manage your gift requests and collaborations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Requests
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myRequests.length} total requests
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
            <div className="text-2xl font-bold">{unreadChats}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myRequests.filter(r => r.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest gift requests and their status</CardDescription>
          </div>
          <Link href="/customer/requests">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No requests yet</p>
              <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.slice(0, 5).map((request) => {
                const chatRoom = chatRooms.find(c => c.requestId === request.id)
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium truncate">{request.category}</h3>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                        <span>
                          Budget: ${request.budgetMin} - ${request.budgetMax}
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
                      <Link href={`/customer/request/${request.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

export default function CustomerDashboardPage() {
  return (
    <DashboardLayout>
      <CustomerDashboardContent />
    </DashboardLayout>
  )
}
