"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare,
  User,
  Eye
} from "lucide-react"
import { useGiftraStore, type ChatStatus } from "@/lib/store"

const chatStatusLabels: Record<ChatStatus, string> = {
  admin_review: "Waiting for Review",
  artist_assigned: "Awaiting Payment",
  artist_chat_active: "Chat Active",
  in_progress: "In Progress",
  paused: "Paused",
  completed: "Completed",
}

const chatStatusColors: Record<ChatStatus, string> = {
  admin_review: "bg-muted text-muted-foreground",
  artist_assigned: "bg-warning/20 text-warning-foreground",
  artist_chat_active: "bg-primary/20 text-primary",
  in_progress: "bg-primary/20 text-primary",
  paused: "bg-muted text-muted-foreground",
  completed: "bg-success/20 text-success-foreground",
}

function AdminChatsContent() {
  const { chatRooms, requests, users, artistProfiles, messages } = useGiftraStore()

  const sortedChats = chatRooms
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Chat Monitor</h1>
        <p className="text-muted-foreground">Monitor all conversations on the platform</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
        <Eye className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          As an admin, you have read-only access to all chats for quality assurance and dispute resolution.
        </p>
      </div>

      {/* Chat List */}
      <Card>
        <CardContent className="p-0">
          {sortedChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No chats yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedChats.map((chat) => {
                const request = requests.find(r => r.id === chat.requestId)
                const customer = users.find(u => u.id === chat.customerId)
                const artist = artistProfiles.find(a => a.id === chat.artistId)
                const chatMessages = messages.filter(m => m.chatRoomId === chat.id)
                const lastMessage = chatMessages[chatMessages.length - 1]

                return (
                  <div
                    key={chat.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{request?.category}</h3>
                        <Badge variant="outline" className={chatStatusColors[chat.status]}>
                          {chatStatusLabels[chat.status]}
                        </Badge>
                        {chat.isLocked && (
                          <Badge variant="outline" className="bg-muted">Locked</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{customer?.name}</span>
                        <span>↔</span>
                        <span>{artist?.name || "Unassigned"}</span>
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Last: {lastMessage.type === "system" 
                            ? `[System] ${lastMessage.content}`
                            : lastMessage.content
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {chatMessages.length} messages
                      </span>
                      <Link href={`/chat/${chat.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
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
    </div>
  )
}

export default function AdminChatsPage() {
  return (
    <DashboardLayout>
      <AdminChatsContent />
    </DashboardLayout>
  )
}
