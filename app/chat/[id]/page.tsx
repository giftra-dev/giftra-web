"use client"

import { use, useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  CreditCard,
  Check,
  Info
} from "lucide-react"
import { 
  getCurrentUser,
  getChatRoom,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getOrderByRequestId,
  createOrder,
  updateOrderStatus,
  updateOrderAndRequestStatus,
  subscribeToMessages,
  uploadFileToStorage,
} from "@/lib/supabase/queries"
import { protectedChatWarning, validateChatMessage } from "@/lib/giftra/message-policy"
import { cn } from "@/lib/utils"
import type { ChatRoomWithRelations, MessageWithSender, Order, Profile } from "@/lib/types/database"
import { REQUEST_STATUS_LABELS, ORDER_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/types/database"

const chatStatusColors: Record<string, string> = {
  pending_review: "bg-muted text-muted-foreground",
  assigned: "bg-warning/10 text-warning-foreground border-warning/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/10 text-success-foreground border-success/30",
}

const mockPaymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS === "true"

function ChatPageContent({ chatId }: { chatId: string }) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messageInput, setMessageInput] = useState("")
  const [contactWarning, setContactWarning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [actionError, setActionError] = useState("")

  const [chatRoom, setChatRoom] = useState<ChatRoomWithRelations | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)

  const loadData = useCallback(async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push('/auth/customer/login')
        return
      }

      const [chatRoomData, messagesData] = await Promise.all([
        getChatRoom(chatId),
        getMessages(chatId),
      ])

      if (!chatRoomData) {
        router.push('/customer/dashboard')
        return
      }

      // Get user profile to determine role
      const { data: profile } = await (await import('@/lib/supabase/client')).createClient()
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setCurrentUser({ id: user.id, role: profile?.role || 'customer' })
      setChatRoom(chatRoomData)
      setMessages(messagesData)

      // Load order if exists
      if (chatRoomData.request_id) {
        const orderData = await getOrderByRequestId(chatRoomData.request_id)
        setOrder(orderData)
      }

      // Mark messages as read
      await markMessagesAsRead(chatId, user.id)
    } catch (error) {
      console.error('Error loading chat:', error)
    } finally {
      setIsLoading(false)
    }
  }, [chatId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatRoom) return

    const channel = subscribeToMessages(chatId, async (newMessage) => {
      // Fetch the full message with sender info
      const { data: fullMessage } = await (await import('@/lib/supabase/client')).createClient()
        .from('messages')
        .select(`*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)`)
        .eq('id', newMessage.id)
        .single()

      if (fullMessage) {
        setMessages(prev => [...prev, fullMessage as MessageWithSender])
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [chatId, chatRoom])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading chat...</div>
      </div>
    )
  }

  if (!currentUser || !chatRoom || !chatRoom.request) {
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

  const request = chatRoom.request
  const isAdmin = currentUser.role === "admin"
  const isCustomer = currentUser.role === "customer"
  const isArtist = currentUser.role === "artist"
  
  // Chat is locked if no order exists or order is awaiting payment
  const isChatLocked = !order || order.status === 'awaiting_payment' || order.status === 'draft'
  const lockReason = !order 
    ? "Chat will unlock after payment is completed." 
    : order.status === 'awaiting_payment' 
      ? "Chat will unlock after payment is completed."
      : null

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isChatLocked || isSending) return

    const validation = validateChatMessage(messageInput)

    if (!validation.valid) {
      setContactWarning(true)
      return
    }

    setIsSending(true)
    try {
      await sendMessage({
        chat_room_id: chatId,
        message_type: 'text',
        content: messageInput.trim(),
      })
      setMessageInput("")
      setContactWarning(false)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePayment = async () => {
    if (!request) return
    
    try {
      setActionError("")
      if (!mockPaymentsEnabled) {
        const { data: newOrder } = await createOrder(request.id)
        if (newOrder) {
          setOrder(newOrder)
          setActionError("Payment provider is not configured. An unpaid order was created.")
          loadData()
        }
        return
      }

      const { data: newOrder } = await createOrder(request.id, `mock_${Date.now()}`)
      if (newOrder) {
        setOrder(newOrder)
        loadData()
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setActionError(error instanceof Error ? error.message : "Unable to process payment.")
    }
  }

  const handleApproveDesign = async () => {
    if (!order || !request) return
    await updateOrderStatus(order.id, "ready_to_ship")
    await loadData()
  }

  const handleRequestRevision = async () => {
    if (!order) return
    await updateOrderStatus(order.id, "revision_requested")
    await loadData()
  }

  const handleMarkDelivered = async () => {
    if (!order || !request) return
    await updateOrderAndRequestStatus(order.id, request.id, "delivered", "delivered", {
      delivered_at: new Date().toISOString(),
    })
    await loadData()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser || isChatLocked || isSending) return

    setIsSending(true)
    setActionError("")

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const { url, error: uploadError } = await uploadFileToStorage(
        "order-artwork",
        `${chatId}/${currentUser.id}/${Date.now()}-${safeName}`,
        file
      )
      if (uploadError) throw uploadError

      await sendMessage({
        chat_room_id: chatId,
        message_type: file.type.startsWith("image/") ? "image" : "file",
        content: file.type.startsWith("image/") ? "Shared an image" : `Shared ${file.name}`,
        attachments: url ? [url] : [],
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setActionError(error instanceof Error ? error.message : "Unable to upload file.")
    } finally {
      event.target.value = ""
      setIsSending(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "customer": return User
      case "artist": return Palette
      case "admin": return Shield
      default: return User
    }
  }

  const getSenderName = (msg: MessageWithSender) => {
    if (msg.message_type === "system") return "System"
    if (msg.sender_id === currentUser.id) return "You"
    return msg.sender?.full_name || "Unknown"
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
          <h1 className="font-semibold truncate">
            {request.title || (request.category && CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS]) || 'Chat'}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {isCustomer 
              ? `with ${chatRoom.artist?.full_name || "Unassigned"}` 
              : `with ${chatRoom.customer?.full_name || "Customer"}`
            }
          </p>
        </div>
        <Badge variant="outline" className={chatStatusColors[request.status as string] || "bg-muted"}>
          {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS] || request.status}
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
          {isChatLocked && lockReason && (
            <div className="px-4 py-3 bg-muted border-b border-border flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {lockReason}
              </p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* System messages pinned at top */}
              {messages.filter(m => m.message_type === "system").length > 0 && (
                <div className="space-y-2 mb-6">
                  {messages.filter(m => m.message_type === "system").map((msg) => (
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
              {messages.filter(m => m.message_type !== "system").map((msg) => {
                const isOwn = msg.sender_id === currentUser.id
                const RoleIcon = getRoleIcon(msg.sender?.role || 'customer')

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
                      msg.sender?.role === "customer" && "bg-secondary",
                      msg.sender?.role === "artist" && "bg-primary/10",
                      msg.sender?.role === "admin" && "bg-accent"
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
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={cn(
                        "rounded-lg px-4 py-2",
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {msg.message_type === "image" && msg.attachments && msg.attachments.length > 0 && (
                          <Image
                            src={msg.attachments[0]} 
                            alt="Shared image" 
                            width={640}
                            height={360}
                            unoptimized
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
                {protectedChatWarning}. Please remove contact information.
              </p>
              <Button size="sm" variant="ghost" onClick={() => setContactWarning(false)}>
                Dismiss
              </Button>
            </div>
          )}

          {actionError && (
            <div className="px-4 py-3 bg-warning/10 border-t border-warning/30 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-foreground" />
              <p className="text-sm text-warning-foreground flex-1">{actionError}</p>
              <Button size="sm" variant="ghost" onClick={() => setActionError("")}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Message Input */}
          {!isAdmin && (
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isChatLocked || isSending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
                <Input
                  placeholder={isChatLocked ? "Chat is locked" : "Type a message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isChatLocked || isSending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim() || isChatLocked || isSending}
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
                  <p className="font-medium">
                    {request.title || (request.category && CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS])}
                  </p>
                  <p className="text-muted-foreground line-clamp-3">{request.description}</p>
                  {request.deadline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(request.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {request.budget_min && request.budget_max && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget: ${request.budget_min} - ${request.budget_max}</span>
                    </div>
                  )}
                  {request.quoted_price && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Check className="w-4 h-4" />
                      <span>Final: ${request.quoted_price}</span>
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
                  {isCustomer && !order && request.quoted_price && (
                    <Button className="w-full gap-2" onClick={handlePayment}>
                      <CreditCard className="w-4 h-4" />
                      {mockPaymentsEnabled
                        ? `Pay $${(request.quoted_price + Math.round(request.quoted_price * 0.15 * 100) / 100).toFixed(2)}`
                        : "Create Payment Order"}
                    </Button>
                  )}
                  {isCustomer && order && order.status === "preview_shared" && (
                    <>
                      <Button className="w-full gap-2" variant="default" onClick={handleApproveDesign}>
                        <Check className="w-4 h-4" />
                        Approve Design
                      </Button>
                      <Button className="w-full gap-2" variant="outline" onClick={handleRequestRevision}>
                        Request Revision
                      </Button>
                    </>
                  )}
                  {isCustomer && order && order.status === "shipped" && (
                    <Button className="w-full gap-2" onClick={handleMarkDelivered}>
                      <Check className="w-4 h-4" />
                      Mark Delivered
                    </Button>
                  )}

                  {/* Order Status */}
                  {order && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                      <Badge variant="outline">
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                  )}

                  {/* No actions available */}
                  {!isAdmin && !order && !request.quoted_price && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Waiting for admin to set price
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
                      <p className="text-sm font-medium">{chatRoom.customer?.full_name || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">Customer</p>
                    </div>
                  </div>
                  {chatRoom.artist && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{chatRoom.artist.full_name}</p>
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
