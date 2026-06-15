"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentUser, getUserChatRooms } from "@/lib/supabase/queries"
import type { ChatRoomWithRelations } from "@/lib/types/database"
import { REQUEST_STATUS_LABELS } from "@/lib/types/database"
import { Lock, MessageSquare, User } from "lucide-react"

const statusColors: Record<string, string> = {
  pending_review: "bg-muted text-muted-foreground",
  approved: "bg-info/20 text-info-foreground border-info/30",
  assigned: "bg-warning/20 text-warning-foreground border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
  delivered: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/20 text-destructive-foreground border-destructive/30",
  rejected: "bg-destructive/20 text-destructive-foreground border-destructive/30",
}

function CustomerChatsContent() {
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadChats = useCallback(async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) return
      setChatRooms(await getUserChatRooms(user.id, "customer"))
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with artists about your requests</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {chatRooms.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No conversations yet</p>
                <p className="text-sm text-muted-foreground">
                  Chats will appear here once an artist is assigned to your request.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {chatRooms.map((chat) => {
                  const status = chat.request?.status
                  return (
                    <Link
                      key={chat.id}
                      href={`/customer/request/${chat.request_id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {chat.is_active ? (
                          <User className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {chat.artist?.full_name || "Assigned artist"}
                          </h3>
                          {status && (
                            <Badge variant="outline" className={statusColors[status]}>
                              {REQUEST_STATUS_LABELS[status] || status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.request?.title || "Untitled request"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(chat.last_message_at).toLocaleDateString()}
                      </div>
                    </Link>
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

export default function CustomerChatsPage() {
  return <CustomerChatsContent />
}
