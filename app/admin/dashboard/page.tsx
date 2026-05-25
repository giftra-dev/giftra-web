"use client"

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
  AlertTriangle
} from "lucide-react"
import { useGiftraStore, type RequestStatus } from "@/lib/store"

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  admin_review: "bg-warning/20 text-warning-foreground border-warning/30",
  artist_assigned: "bg-info/20 text-info-foreground border-info/30",
  awaiting_payment: "bg-accent text-accent-foreground",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

function AdminDashboardContent() {
  const { requests, orders, chatRooms, users, artistProfiles } = useGiftraStore()

  const pendingRequests = requests.filter(r => r.status === "pending" || r.status === "admin_review")
  const activeOrders = orders.filter(o => !["completed", "refunded"].includes(o.status))
  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0)
  const activeChats = chatRooms.filter(c => !c.isLocked)

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
              {pendingRequests.length} requests awaiting review
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
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
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Artists
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artistProfiles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for assignments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => {
                const customer = users.find(u => u.id === request.customerId)
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{request.category}</span>
                        <Badge variant="outline" className={statusColors[request.status]}>
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer?.name} - ${request.budgetMin}-${request.budgetMax}
                      </p>
                    </div>
                    <Link href="/admin/requests">
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
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
            {activeChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active chats</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeChats.slice(0, 5).map((chat) => {
                  const request = requests.find(r => r.id === chat.requestId)
                  const customer = users.find(u => u.id === chat.customerId)
                  const artist = artistProfiles.find(a => a.id === chat.artistId)
                  return (
                    <div
                      key={chat.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{request?.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer?.name} ↔ {artist?.name}
                        </p>
                      </div>
                      <Link href={`/chat/${chat.id}`}>
                        <Button size="sm" variant="ghost">Monitor</Button>
                      </Link>
                    </div>
                  )
                })}
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
