"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getAllSupportConversations,
  getSupportMessages,
  sendSupportMessage,
  updateSupportConversationStatus,
} from "@/lib/supabase/queries"
import type { SupportConversationWithRelations, SupportMessage } from "@/lib/types/database"
import { MessageCircle, RefreshCw, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversationWithRelations[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  async function loadConversations() {
    setLoading(true)
    const data = await getAllSupportConversations()
    setConversations(data)
    setSelectedId((current) => current || data[0]?.id || null)
    setLoading(false)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    getSupportMessages(selectedId).then(setMessages)
  }, [selectedId])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) || null,
    [conversations, selectedId]
  )

  async function handleSend() {
    const trimmed = draft.trim()
    if (!selectedId || !trimmed) return

    setSending(true)
    const { data } = await sendSupportMessage(selectedId, trimmed)
    setSending(false)

    if (data) {
      setMessages((current) => [...current, data])
      setDraft("")
      await loadConversations()
    }
  }

  async function toggleStatus() {
    if (!selectedConversation) return
    await updateSupportConversationStatus(
      selectedConversation.id,
      selectedConversation.status === "open" ? "closed" : "open"
    )
    await loadConversations()
  }

  return (
    <DashboardLayout>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Support Inbox</h1>
            <p className="text-sm text-muted-foreground">Reply to customer chats created from the floating website widget.</p>
          </div>
          <Button variant="outline" onClick={loadConversations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">Loading support conversations...</CardContent>
          </Card>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No support chats yet</p>
              <p className="text-sm text-muted-foreground">Customer messages from the floating widget will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid min-h-[620px] gap-4 lg:grid-cols-[340px_1fr]">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={cn(
                        "block w-full p-4 text-left hover:bg-muted/60",
                        selectedId === conversation.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{conversation.customer?.full_name || conversation.customer?.email || "Customer"}</p>
                        <Badge variant={conversation.status === "open" ? "default" : "secondary"}>{conversation.status}</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.subject}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(conversation.last_message_at || conversation.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="flex h-full min-h-[620px] flex-col p-0">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <p className="font-semibold">{selectedConversation?.customer?.full_name || "Customer"}</p>
                    <p className="text-sm text-muted-foreground">{selectedConversation?.customer?.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleStatus}>
                    Mark {selectedConversation?.status === "open" ? "closed" : "open"}
                  </Button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-background/50 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                        message.is_admin ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>
                <form
                  className="flex gap-2 border-t p-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleSend()
                  }}
                >
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Reply to customer..."
                    disabled={sending || selectedConversation?.status === "closed"}
                  />
                  <Button type="submit" size="icon" disabled={!draft.trim() || sending || selectedConversation?.status === "closed"}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
