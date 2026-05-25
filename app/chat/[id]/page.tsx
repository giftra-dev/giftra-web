"use client"

import { use, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon,
  Lock,
  Shield,
  User,
  Palette,
  AlertTriangle,
  Calendar,
  DollarSign,
  Upload,
  CreditCard,
  Check,
  FileText,
  Info
} from "lucide-react"
import { useGiftraStore, type ChatStatus, type Message, type UserRole } from "@/lib/store"
import { cn } from "@/lib/utils"

const chatStatusLabels: Record<ChatStatus, string> = {
  admin_review: "Waiting for admin review",
  artist_assigned: "Artist assigned, awaiting payment",
  artist_chat_active: "Chat active with artist",
  in_progress: "Work in progress",
  paused: "Order paused",
  completed: "Order completed",
}

const chatStatusColors: Record<ChatStatus, string> = {
  admin_review: "bg-muted text-muted-foreground",
  artist_assigned: "bg-warning/10 text-warning-foreground border-warning/30",
  artist_chat_active: "bg-primary/10 text-primary border-primary/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-muted text-muted-foreground",
  completed: "bg-success/10 text-success-foreground border-success/30",
}

// Regex patterns for detecting contact info
const contactPatterns = [
  /\b\d{10,}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /@[a-zA-Z0-9_]{1,30}/, // Instagram/Twitter handles
  /wa\.me|whatsapp/i, // WhatsApp links
  /\b(phone|call|text|whatsapp|instagram|telegram|signal)\s*:?\s*\d/i, // Contact hints
]

function detectContactInfo(text: string): boolean {
  return contactPatterns.some(pattern => pattern.test(text))
}

function ChatPageContent({ chatId }: { chatId: string }) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageInput, setMessageInput] = useState("")
  const [contactWarning, setContactWarning] = useState(false)
  
  const { 
    currentUser, 
    chatRooms, 
    requests, 
    orders, 
    users, 
    artistProfiles,
    messages,
    sendMessage,
    markMessagesRead,
    createOrder,
    updateOrderStatus
  } = useGiftraStore()

  const chatRoom = chatRooms.find(c => c.id === chatId)
  const request = chatRoom ? requests.find(r => r.id === chatRoom.requestId) : null
  const order = chatRoom?.orderId ? orders.find(o => o.id === chatRoom.orderId) : null
  const chatMessages = messages.filter(m => m.chatRoomId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
  const customer = chatRoom ? users.find(u => u.id === chatRoom.customerId) : null
  const artist = chatRoom?.artistId ? artistProfiles.find(a => a.id === chatRoom.artistId) : null

  const isAdmin = currentUser?.role === "admin"
  const isCustomer = currentUser?.role === "customer"
  const isArtist = currentUser?.role === "artist"

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length])

  // Mark messages as read
  useEffect(() => {
    if (chatRoom && currentUser) {
      markMessagesRead(chatId)
    }
  }, [chatId, chatRoom, currentUser, markMessagesRead])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to continue</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!chatRoom || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chat not found</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || chatRoom.isLocked) return

    // Check for contact info
    if (detectContactInfo(messageInput)) {
      setContactWarning(true)
      return
    }

    sendMessage(chatId, messageInput.trim())
    setMessageInput("")
    setContactWarning(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePayment = () => {
    if (request) {
      createOrder(request.id)
    }
  }

  const handleUploadDraft = () => {
    sendMessage(chatId, "I have uploaded a draft preview for your review. Please take a look and let me know your thoughts!", "text")
  }

  const handleMarkReady = () => {
    if (order) {
      updateOrderStatus(order.id, "ready_to_ship")
      sendMessage(chatId, "The artwork is complete and ready for delivery!", "system")
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "customer": return User
      case "artist": return Palette
      case "admin": return Shield
    }
  }

  const getSenderName = (msg: Message) => {
    if (msg.senderId === "system") return "System"
    if (msg.senderId === currentUser.id) return "You"
    if (msg.senderId === customer?.id) return customer.name
    if (msg.senderId === artist?.id) return artist.name
    return "Unknown"
  }

  const backUrl = currentUser.role === "admin" 
    ? "/admin/chats" 
    : currentUser.role === "artist" 
      ? "/artist/chats" 
      : "/customer/chats"

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center gap-4 flex-shrink-0">
        <Link href={backUrl}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{request.category}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {isCustomer ? `with ${artist?.name || "Unassigned"}` : `with ${customer?.name}`}
          </p>
        </div>
        <Badge variant="outline" className={chatStatusColors[chatRoom.status]}>
          {chatStatusLabels[chatRoom.status]}
        </Badge>
      </header>

      {/* Trust Banner */}
      <div className="px-4 py-2 bg-primary/5 border-b border-primary/20 flex items-center gap-2 flex-shrink-0">
        <Lock className="w-4 h-4 text-primary" />
        <p className="text-xs text-primary">
          Protected by Giftra - All activity is monitored for quality and safety
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Status Banner */}
          {chatRoom.isLocked && (
            <div className="px-4 py-3 bg-muted border-b border-border flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {chatRoom.lockReason || "Chat is locked"}
              </p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* System messages pinned at top */}
              {chatMessages.filter(m => m.type === "system").length > 0 && (
                <div className="space-y-2 mb-6">
                  {chatMessages.filter(m => m.type === "system").map((msg) => (
                    <div 
                      key={msg.id} 
                      className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="h-px flex-1 bg-border" />
                      <Info className="w-3 h-3" />
                      <span>{msg.content}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  ))}
                </div>
              )}

              {/* Regular messages */}
              {chatMessages.filter(m => m.type !== "system").map((msg) => {
                const isOwn = msg.senderId === currentUser.id
                const RoleIcon = getRoleIcon(msg.senderRole)

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      msg.senderRole === "customer" && "bg-secondary",
                      msg.senderRole === "artist" && "bg-primary/10",
                      msg.senderRole === "admin" && "bg-accent"
                    )}>
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div className={cn(
                      "max-w-[70%] space-y-1",
                      isOwn && "items-end"
                    )}>
                      <div className={cn(
                        "flex items-center gap-2 text-xs text-muted-foreground",
                        isOwn && "flex-row-reverse"
                      )}>
                        <span className="font-medium">{getSenderName(msg)}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={cn(
                        "rounded-lg px-4 py-2",
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {msg.type === "image" && msg.imageUrl && (
                          <img 
                            src={msg.imageUrl} 
                            alt="Shared image" 
                            className="rounded-md max-w-full mb-2"
                          />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Contact Warning */}
          {contactWarning && (
            <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/30 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive flex-1">
                To keep your order protected, communication must stay on Giftra. Please remove contact information.
              </p>
              <Button size="sm" variant="ghost" onClick={() => setContactWarning(false)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Message Input */}
          {!isAdmin && (
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button variant="ghost" size="icon" disabled={chatRoom.isLocked}>
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  placeholder={chatRoom.isLocked ? "Chat is locked" : "Type a message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatRoom.isLocked}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim() || chatRoom.isLocked}
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="p-4 border-t border-border bg-muted text-center">
              <p className="text-sm text-muted-foreground">
                You are viewing this chat as an admin (read-only)
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Order Context */}
        <aside className="w-80 border-l border-border bg-card hidden lg:flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Order Details</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Request Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{request.category}</p>
                  <p className="text-muted-foreground line-clamp-3">{request.description}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(request.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget: ${request.budgetMin} - ${request.budgetMax}</span>
                  </div>
                  {request.adminPrice && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Check className="w-4 h-4" />
                      <span>Final: ${request.adminPrice}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions Panel */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Customer Actions */}
                  {isCustomer && chatRoom.status === "artist_assigned" && !order && request.adminPrice && (
                    <Button className="w-full gap-2" onClick={handlePayment}>
                      <CreditCard className="w-4 h-4" />
                      Pay ${request.adminPrice}
                    </Button>
                  )}
                  {isCustomer && order && order.status === "preview_shared" && (
                    <>
                      <Button className="w-full gap-2" variant="default">
                        <Check className="w-4 h-4" />
                        Approve Design
                      </Button>
                      <Button className="w-full gap-2" variant="outline">
                        Request Revision
                      </Button>
                    </>
                  )}

                  {/* Artist Actions */}
                  {isArtist && order && order.status === "in_progress" && (
                    <>
                      <Button className="w-full gap-2" variant="outline" onClick={handleUploadDraft}>
                        <Upload className="w-4 h-4" />
                        Upload Draft
                      </Button>
                      <Button className="w-full gap-2" onClick={handleMarkReady}>
                        <Check className="w-4 h-4" />
                        Mark Ready
                      </Button>
                    </>
                  )}

                  {/* No actions available */}
                  {((isCustomer && chatRoom.status !== "artist_assigned" && (!order || order.status !== "preview_shared")) ||
                    (isArtist && (!order || order.status !== "in_progress"))) && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No actions available
                    </p>
                  )}

                  {isAdmin && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Admin view only
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{customer?.name}</p>
                      <p className="text-xs text-muted-foreground">Customer</p>
                    </div>
                  </div>
                  {artist && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{artist.name}</p>
                        <p className="text-xs text-muted-foreground">Artist</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}

export default function ChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  return <ChatPageContent chatId={id} />
}
