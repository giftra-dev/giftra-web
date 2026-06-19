"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X } from "lucide-react"
import {
  getCurrentProfile,
  getCurrentUser,
  getOrCreateSupportConversation,
  getSupportMessages,
  sendSupportMessage,
  subscribeToSupportMessages,
} from "@/lib/supabase/queries"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import type { Profile, SupportConversation, SupportMessage } from "@/lib/types/database"
import { cn } from "@/lib/utils"

export function SupportChatWidget() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hasSupabaseConfig) return

    let mounted = true
    Promise.all([getCurrentUser(), getCurrentProfile()])
      .then(([{ user }, currentProfile]) => {
        if (!mounted) return
        setUserId(user?.id || null)
        setProfile(currentProfile)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Unable to load your chat profile.")
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!open || !userId || profile?.role === "admin" || conversation || !hasSupabaseConfig) return

    let mounted = true
    setIsLoading(true)
    setError("")
    const timeout = window.setTimeout(() => {
      if (!mounted) return
      setIsLoading(false)
      setError("Unable to start support chat. Please refresh or contact Giftra after signing in again.")
    }, 12000)

    getOrCreateSupportConversation()
      .then(async ({ data, error: conversationError }) => {
        if (!mounted) return
        if (conversationError || !data) {
          throw conversationError || new Error("Unable to start support chat.")
        }
        setConversation(data)
        setMessages(await getSupportMessages(data.id))
        window.clearTimeout(timeout)
      })
      .catch((err) => {
        if (!mounted) return
        window.clearTimeout(timeout)
        setError(err instanceof Error ? err.message : "Unable to start support chat.")
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
      window.clearTimeout(timeout)
    }
  }, [conversation, open, profile?.role, userId])

  useEffect(() => {
    if (!conversation) return

    const channel = subscribeToSupportMessages(conversation.id, (message) => {
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message]
      )
    })

    return () => {
      channel.unsubscribe()
    }
  }, [conversation])

  const panelTitle = useMemo(() => {
    if (!userId) return "Chat with Giftra"
    return conversation?.subject || "Chat with Giftra"
  }, [conversation?.subject, userId])

  if (profile?.role === "admin") return null

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!conversation || !trimmed) return

    setIsSending(true)
    setError("")
    const { data, error: sendError } = await sendSupportMessage(conversation.id, trimmed)
    setIsSending(false)

    if (sendError || !data) {
      setError(sendError?.message || "Message could not be sent.")
      return
    }

    setMessages((current) =>
      current.some((message) => message.id === data.id) ? current : [...current, data]
    )
    setDraft("")
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="text-sm font-semibold">{panelTitle}</p>
              <p className="text-xs opacity-85">Admin team chat</p>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/15" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!userId ? (
            <div className="space-y-4 p-4">
              {error && <p className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
              <p className="text-sm text-muted-foreground">
                Please sign in first to create a chat with the Giftra admin team.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/customer/login">Sign in to chat</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="h-80 space-y-3 overflow-y-auto bg-background/50 p-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Starting support chat...</p>
                ) : messages.length === 0 ? (
                  <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
                    Tell us what you need help with. The admin team will reply here.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        message.sender_id === userId
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.is_admin && (
                        <Badge variant="secondary" className="mb-1 h-5 rounded-sm px-1.5 text-[10px]">
                          Giftra
                        </Badge>
                      )}
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))
                )}
              </div>

              {error && <p className="border-t px-4 py-2 text-xs text-destructive">{error}</p>}

              <form
                className="flex gap-2 border-t p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSend()
                }}
              >
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  disabled={isSending || isLoading}
                />
                <Button type="submit" size="icon" disabled={!draft.trim() || isSending || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      <Button
        className="h-12 rounded-full px-4 shadow-lg"
        onClick={() => setOpen((current) => !current)}
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Chat with Giftra
      </Button>
    </div>
  )
}
