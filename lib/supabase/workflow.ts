import { createClient } from "@/lib/supabase/client"
import type { GiftCategory, MessageType } from "@/lib/types/database"
import type { OrderStatus } from "@/lib/giftra/state-machine"
import { canTransitionOrder } from "@/lib/giftra/state-machine"
import { validateChatMessage } from "@/lib/giftra/message-policy"

export type CreateGiftRequestInput = {
  category: GiftCategory
  description: string
  budget_min: number
  budget_max: number
  deadline: string
  reference_images?: string[]
}

export type SendWorkflowMessageInput = {
  chat_room_id: string
  message_type?: Extract<MessageType, "text" | "image" | "file">
  content: string
  attachments?: string[]
}

async function getCurrentUserOrThrow() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Not authenticated")
  }

  return { supabase, user }
}

export async function createGiftRequest(input: CreateGiftRequestInput) {
  const { supabase, user } = await getCurrentUserOrThrow()

  return supabase
    .from("gift_requests")
    .insert({
      customer_id: user.id,
      category: input.category,
      description: input.description,
      budget_min: input.budget_min,
      budget_max: input.budget_max,
      deadline: input.deadline,
      reference_images: input.reference_images ?? [],
      status: "admin_review",
    })
    .select()
    .single()
}

export async function assignArtistAndPrice(input: {
  gift_request_id: string
  artist_id: string
  final_price: number
}) {
  const { supabase } = await getCurrentUserOrThrow()

  const { data, error } = await supabase.rpc("assign_artist_and_price", {
    p_gift_request_id: input.gift_request_id,
    p_artist_id: input.artist_id,
    p_final_price: input.final_price,
  })

  if (error) throw error
  return data
}

export async function recordPaymentAndUnlockChat(input: {
  order_id: string
  provider_payment_id: string
  amount: number
}) {
  const { supabase } = await getCurrentUserOrThrow()

  const { data, error } = await supabase.rpc("record_payment_and_unlock_chat", {
    p_order_id: input.order_id,
    p_provider_payment_id: input.provider_payment_id,
    p_amount: input.amount,
  })

  if (error) throw error
  return data
}

export async function transitionOrder(input: {
  order_id: string
  from: OrderStatus
  to: OrderStatus
  note?: string
}) {
  if (!canTransitionOrder(input.from, input.to)) {
    throw new Error(`Invalid order transition: ${input.from} -> ${input.to}`)
  }

  const { supabase } = await getCurrentUserOrThrow()

  const { data, error } = await supabase.rpc("transition_order", {
    p_order_id: input.order_id,
    p_from_status: input.from,
    p_to_status: input.to,
    p_note: input.note ?? null,
  })

  if (error) throw error
  return data
}

export async function sendWorkflowMessage(input: SendWorkflowMessageInput) {
  const validation = validateChatMessage(input.content)

  if (!validation.valid) {
    throw new Error(validation.reason ?? "Message is not allowed")
  }

  const { supabase } = await getCurrentUserOrThrow()

  const { data, error } = await supabase.rpc("send_chat_message", {
    p_chat_room_id: input.chat_room_id,
    p_message_type: input.message_type ?? "text",
    p_content: input.content.trim(),
    p_attachments: input.attachments ?? [],
  })

  if (error) throw error
  return data
}

export async function uploadWorkflowFile(input: {
  bucket: "reference-images" | "order-artwork"
  path: string
  file: File
}) {
  const { supabase } = await getCurrentUserOrThrow()

  return supabase.storage.from(input.bucket).upload(input.path, input.file, {
    cacheControl: "3600",
    upsert: false,
  })
}
