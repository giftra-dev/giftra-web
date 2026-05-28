"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllChatRooms } from "@/lib/supabase/queries"
import type { ChatRoomWithRelations } from "@/lib/types/database"
import { REQUEST_STATUS_LABELS } from "@/lib/types/database"
import { Eye, MessageSquare, Search, User } from "lucide-react"

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

function AdminChatsContent() {
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRelations[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadChats = useCallback(async () => {
    try {
      setChatRooms(await getAllChatRooms())
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const filteredChats = chatRooms.filter((chat) => {
    const searchText = [
      chat.request?.title,
      chat.request?.category,
      chat.request?.status,
      chat.customer?.full_name,
      chat.artist?.full_name,
    ].join(" ").toLowerCase()
    return searchText.includes(search.toLowerCase())
  })

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
          <h1 className="text-2xl font-bold">Chat Monitor</h1>
          <p className="text-muted-foreground">Review active customer and artist conversations</p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
          <Eye className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Admin access is intended for quality assurance, support, and dispute resolution.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No chats found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredChats.map((chat) => {
                  const status = chat.request?.status
                  return (
                    <div key={chat.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{chat.request?.title || "Untitled request"}</h3>
                          {status && (
                            <Badge variant="outline" className={statusColors[status]}>
                              {REQUEST_STATUS_LABELS[status] || status}
                            </Badge>
                          )}
                          {!chat.is_active && <Badge variant="outline">Inactive</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{chat.customer?.full_name || "Customer"}</span>
                          <span>to</span>
                          <span>{chat.artist?.full_name || "Unassigned artist"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last activity {new Date(chat.last_message_at).toLocaleString()}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <Link href={`/chat/${chat.id}`}>
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </Button>
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

export default function AdminChatsPage() {
  return <AdminChatsContent />
}
