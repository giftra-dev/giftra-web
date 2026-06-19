"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getCurrentProfile,
  getCurrentUser,
  getMessages,
  sendMessage,
  subscribeToMessages,
  updateChatModeration,
  updateRequestQuote,
  uploadFileToStorage,
} from "@/lib/supabase/queries"
import { protectedChatWarning, validateChatMessage } from "@/lib/giftra/message-policy"
import type { ChatRoom, MessageWithSender, Profile, RequestWithRelations, UserRole } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { AlertTriangle, ImageIcon, Send } from "lucide-react"

const maxChatFileSize = 10 * 1024 * 1024

const templates = {
  customer: [
    "I like this direction. Can we discuss size, timeline, and final price?",
    "Can you share what details you need from me before starting?",
    "This looks good to me. Please fix the price so I can complete payment.",
  ],
  artist: [
    "Thanks for the brief. I can create this style with the details shared.",
    "Can you confirm the size, recipient name, and delivery date?",
    "I agree with the scope. I have fixed the price for payment.",
  ],
  admin: [
    "Please keep all communication inside Giftra for safety and order protection.",
    "This chat has been paused while Giftra reviews guideline compliance.",
    "Giftra has ended this chat due to guideline violations.",
  ],
}

export function RequestChatPanel({
  chatRoom,
  request,
  onChanged,
}: {
  chatRoom: ChatRoom
  request: RequestWithRelations
  onChanged?: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState("")
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [quote, setQuote] = useState(request.quoted_price?.toString() || "")
  const [moderationText, setModerationText] = useState(chatRoom.moderation_warning || "")

  const loadMessages = useCallback(async () => {
    const [{ user }, currentProfile, messageData] = await Promise.all([
      getCurrentUser(),
      getCurrentProfile(),
      getMessages(chatRoom.id),
    ])
    setUserId(user?.id || "")
    setProfile(currentProfile)
    setMessages(messageData)
  }, [chatRoom.id])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    const channel = subscribeToMessages(chatRoom.id, async () => {
      setMessages(await getMessages(chatRoom.id))
    })
    return () => {
      channel.unsubscribe()
    }
  }, [chatRoom.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const role: UserRole = profile?.role || "customer"
  const canSend = chatRoom.moderation_status === "active" && chatRoom.is_active
  const canFixPrice = role === "artist" || role === "admin"
  const isAdmin = role === "admin"

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || !canSend || sending) return

    const validation = validateChatMessage(trimmed)
    if (!validation.valid) {
      setError(protectedChatWarning)
      return
    }

    setSending(true)
    setError("")
    setMessage("")
    const { error: sendError } = await sendMessage({
      chat_room_id: chatRoom.id,
      message_type: "text",
      content: trimmed,
    })
    setSending(false)

    if (sendError) {
      setError(sendError.message)
      return
    }

    setDraft("")
    setMessage("Message sent.")
    await loadMessages()
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !canSend || sending) return

    if (file.size > maxChatFileSize) {
      setError("Files must be 10 MB or smaller.")
      return
    }

    setSending(true)
    setError("")
    setMessage("")
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const { url, error: uploadError } = await uploadFileToStorage(
        "order-artwork",
        `${userId}/${chatRoom.id}/${Date.now()}-${safeName}`,
        file
      )
      if (uploadError || !url) throw uploadError || new Error("Unable to upload file.")

      await sendMessage({
        chat_room_id: chatRoom.id,
        message_type: file.type.startsWith("image/") ? "image" : "file",
        content: file.type.startsWith("video/") ? `Shared video: ${file.name}` : `Shared file: ${file.name}`,
        attachments: [url],
      })
      setMessage("Attachment shared.")
      await loadMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload file.")
    } finally {
      setSending(false)
    }
  }

  const handleFixPrice = async () => {
    const amount = Number.parseFloat(quote)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid price.")
      return
    }

    const { error: quoteError } = await updateRequestQuote(request.id, amount, `Final price fixed at ${amount}.`)
    if (quoteError) {
      setError(quoteError.message)
      return
    }
    setError("")
    setMessage("Final price sent to the customer for approval.")
    onChanged?.()
    await loadMessages()
  }

  const handleModeration = async (status: ChatRoom["moderation_status"]) => {
    const warning = moderationText || "Giftra admin has reviewed this chat for guideline compliance."
    const { error: moderationError } = await updateChatModeration(chatRoom.id, status, warning)
    if (moderationError) {
      setError(moderationError.message)
      return
    }
    setError("")
    setMessage(status === "active" ? "Chat resumed." : `Chat ${status}. Warning message posted below the transcript.`)
    onChanged?.()
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-semibold">Discussion with artist</h2>
          <p className="text-sm text-muted-foreground">Agree on details and final price before payment.</p>
        </div>
        <Badge variant={chatRoom.moderation_status === "active" ? "default" : "destructive"}>
          {chatRoom.moderation_status}
        </Badge>
      </div>

      <div className="h-[420px] space-y-3 overflow-y-auto bg-background/40 p-4">
        {messages.length === 0 ? (
          <p className="rounded-md border bg-card p-3 text-sm text-muted-foreground">
            Start the discussion here. Payment can happen after the scope and price are agreed.
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === userId
            return (
              <div key={message.id} className={cn("flex", isOwn && "justify-end")}>
                <div className={cn("max-w-[82%] rounded-lg px-3 py-2 text-sm", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p className="mb-1 text-[11px] opacity-70">{isOwn ? "You" : message.sender?.full_name || "Giftra"}</p>
                  {message.attachments?.map((attachment) => (
                    <a key={attachment} href={attachment} target="_blank" rel="noreferrer" className="mb-2 block underline">
                      {message.message_type === "image" ? (
                        <img src={attachment} alt="" className="max-h-56 rounded-md object-contain" />
                      ) : (
                        "Open attachment"
                      )}
                    </a>
                  ))}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {chatRoom.moderation_status !== "active" && (
        <div className="border-t bg-destructive/10 p-3 text-sm text-destructive">
          {chatRoom.moderation_warning || "Giftra has paused this chat for guideline review."}
        </div>
      )}

      <div className="space-y-3 border-t p-3">
        <div className="flex flex-wrap gap-2">
          {templates[role].map((template) => (
            <Button key={template} type="button" variant="outline" size="sm" onClick={() => setDraft(template)}>
              {template.slice(0, 28)}...
            </Button>
          ))}
        </div>

        {canFixPrice && (
          <div className="flex gap-2">
            <Input value={quote} onChange={(event) => setQuote(event.target.value)} type="number" placeholder="Final price" />
            <Button type="button" onClick={handleFixPrice}>Fix price</Button>
          </div>
        )}

        {isAdmin && (
          <div className="grid gap-2 md:grid-cols-[1fr_150px_150px]">
            <Textarea value={moderationText} onChange={(event) => setModerationText(event.target.value)} placeholder="Customer warning message" rows={2} />
            <Button type="button" variant="outline" onClick={() => handleModeration("paused")}>Pause chat</Button>
            <Button type="button" variant="destructive" onClick={() => handleModeration("ended")}>End chat</Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-success/10 p-2 text-sm text-success-foreground">
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" disabled={!canSend || sending} onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf" className="sr-only" onChange={handleUpload} />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder={canSend ? "Type a message..." : "Chat is paused by Giftra"}
            disabled={!canSend || sending}
          />
          <Button type="button" size="icon" disabled={!draft.trim() || !canSend || sending} onClick={handleSend}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Images, videos, and PDFs up to 10 MB.</p>
      </div>
    </div>
  )
}
