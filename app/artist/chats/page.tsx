"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare,
  User
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

function ArtistChatsContent() {
  const { currentUser, chatRooms, requests, users, messages } = useGiftraStore()

  if (!currentUser) return null

  const myChats = chatRooms
    .filter(c => c.artistId === currentUser.id)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with customers about their orders</p>
      </div>

      {/* Chat List */}
      <Card>
        <CardContent className="p-0">
          {myChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Chats will appear here when you are assigned to orders
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myChats.map((chat) => {
                const request = requests.find(r => r.id === chat.requestId)
                const customer = users.find(u => u.id === chat.customerId)
                const chatMessages = messages.filter(m => m.chatRoomId === chat.id)
                const lastMessage = chatMessages[chatMessages.length - 1]
                const unreadCount = chatMessages.filter(m => !m.isRead && m.senderId !== currentUser.id).length

                return (
                  <Link
                    key={chat.id}
                    href={chat.isLocked ? "#" : `/chat/${chat.id}`}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${chat.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {customer?.name || "Customer"}
                        </h3>
                        <Badge variant="outline" className={chatStatusColors[chat.status]}>
                          {chatStatusLabels[chat.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {request?.category}: {request?.description.slice(0, 50)}...
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {lastMessage.type === "system" 
                            ? `System: ${lastMessage.content}`
                            : lastMessage.content
                          }
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ArtistChatsPage() {
  return (
    <DashboardLayout>
      <ArtistChatsContent />
    </DashboardLayout>
  )
}
