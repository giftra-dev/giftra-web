import type { UserRole } from "@/lib/types/database"

export type GiftRequestStatus =
  | "admin_review"
  | "approved"
  | "artist_assigned"
  | "awaiting_payment"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected"

export type OrderStatus =
  | "draft"
  | "awaiting_payment"
  | "in_progress"
  | "preview_shared"
  | "revision_requested"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "completed"
  | "refunded"

export type ChatWorkflowState =
  | "admin_review"
  | "artist_assigned"
  | "artist_chat_active"
  | "in_progress"
  | "paused"
  | "completed"

export type ChatAction =
  | "pay_advance"
  | "approve_design"
  | "request_revision"
  | "upload_draft"
  | "upload_final"
  | "mark_ready"
  | "override_assignment"
  | "resolve_dispute"
  | "view_internal_notes"

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["awaiting_payment", "refunded"],
  awaiting_payment: ["in_progress", "refunded"],
  in_progress: ["preview_shared", "ready_to_ship", "refunded"],
  preview_shared: ["revision_requested", "ready_to_ship", "refunded"],
  revision_requested: ["preview_shared", "refunded"],
  ready_to_ship: ["shipped", "completed", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["completed", "refunded"],
  completed: [],
  refunded: [],
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return orderTransitions[from]?.includes(to) ?? false
}

export function getChatWorkflowState(input: {
  requestStatus: GiftRequestStatus
  orderStatus?: OrderStatus | null
  isPaused?: boolean
}): ChatWorkflowState {
  if (input.isPaused) return "paused"
  if (input.orderStatus === "completed" || input.requestStatus === "completed") return "completed"
  if (input.orderStatus === "in_progress") return "in_progress"
  if (input.orderStatus && input.orderStatus !== "awaiting_payment" && input.orderStatus !== "draft") {
    return "artist_chat_active"
  }
  if (input.requestStatus === "artist_assigned" || input.requestStatus === "awaiting_payment") {
    return "artist_assigned"
  }
  return "admin_review"
}

export function isChatLocked(state: ChatWorkflowState, orderStatus?: OrderStatus | null) {
  return (
    state === "admin_review" ||
    state === "paused" ||
    state === "completed" ||
    orderStatus === "draft" ||
    orderStatus === "awaiting_payment"
  )
}

export function getChatLockReason(state: ChatWorkflowState, orderStatus?: OrderStatus | null) {
  if (state === "admin_review") return "Chat will unlock after an artist is assigned."
  if (orderStatus === "draft" || orderStatus === "awaiting_payment") {
    return "Chat will unlock after payment is completed."
  }
  if (state === "paused") return "Chat is paused while Giftra reviews this order."
  if (state === "completed") return "Chat is closed because this order is completed."
  return null
}

export function canSendMessage(input: {
  role: UserRole
  state: ChatWorkflowState
  orderStatus?: OrderStatus | null
}) {
  if (input.role === "admin") return false
  return !isChatLocked(input.state, input.orderStatus)
}

export function canPerformChatAction(input: {
  role: UserRole
  action: ChatAction
  state: ChatWorkflowState
  orderStatus?: OrderStatus | null
}) {
  const { role, action, state, orderStatus } = input

  if (role === "customer") {
    if (action === "pay_advance") return state === "artist_assigned"
    if (action === "approve_design") return orderStatus === "preview_shared"
    if (action === "request_revision") return orderStatus === "preview_shared"
    return false
  }

  if (role === "artist") {
    if (action === "upload_draft") return orderStatus === "in_progress" || orderStatus === "revision_requested"
    if (action === "upload_final") return orderStatus === "ready_to_ship"
    if (action === "mark_ready") return orderStatus === "preview_shared"
    return false
  }

  if (role === "admin") {
    return action === "override_assignment" || action === "resolve_dispute" || action === "view_internal_notes"
  }

  return false
}
