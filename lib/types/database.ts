// Database types for Giftra
// These types match the Supabase schema

export type UserRole = 'customer' | 'artist' | 'admin'

export type RequestStatus =
  | 'pending_review'
  | 'approved'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'delivered'
  | 'cancelled'
  | 'rejected'

export type OrderStatus =
  | 'draft'
  | 'awaiting_payment'
  | 'paid'
  | 'in_progress'
  | 'preview_shared'
  | 'revision_requested'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'refunded'

export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'system'
  | 'revision_request'
  | 'approval'
  | 'quote'

export type ArtistRequestDecision = 'pending' | 'accepted' | 'rejected'

export type GiftCategory =
  | 'portrait'
  | 'caricature'
  | 'illustration'
  | 'calligraphy'
  | 'custom_jewelry'
  | 'woodwork'
  | 'pottery'
  | 'textile'
  | 'digital_art'
  | 'other'

// Database row types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  customer_preferences: Record<string, unknown>
  // Artist-specific
  bio: string | null
  portfolio_url: string | null
  specialties: GiftCategory[]
  rating: number
  total_reviews: number
  is_available: boolean
  // Admin
  is_super_admin: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

export interface Request {
  id: string
  customer_id: string
  assigned_artist_id: string | null
  inspiration_artwork_id: string | null
  approved_by_admin_id: string | null
  // Details
  title: string
  description: string
  category: GiftCategory
  reference_images: string[]
  // Recipient
  recipient_name: string | null
  occasion: string | null
  deadline: string | null
  // Pricing
  budget_min: number | null
  budget_max: number | null
  quoted_price: number | null
  final_price: number | null
  artist_decision: ArtistRequestDecision
  artist_decision_note: string | null
  artist_decision_at: string | null
  // Status
  status: RequestStatus
  admin_notes: string | null
  rejection_reason: string | null
  // Timestamps
  created_at: string
  updated_at: string
  approved_at: string | null
  assigned_at: string | null
  completed_at: string | null
}

export interface ChatRoom {
  id: string
  request_id: string
  customer_id: string
  artist_id: string | null
  is_active: boolean
  moderation_status: 'active' | 'paused' | 'ended'
  moderation_warning: string | null
  moderated_by_admin_id: string | null
  moderated_at: string | null
  admin_can_view: boolean
  created_at: string
  last_message_at: string
}

export interface Message {
  id: string
  chat_room_id: string
  sender_id: string
  message_type: MessageType
  content: string
  attachments: string[]
  quote_amount: number | null
  quote_details: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  request_id: string
  customer_id: string
  artist_id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  platform_fee: number
  total: number
  payment_intent_id: string | null
  paid_at: string | null
  shipping_address: ShippingAddress | null
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Review {
  id: string
  order_id: string
  customer_id: string
  artist_id: string
  rating: number
  title: string | null
  content: string | null
  artist_response: string | null
  artist_responded_at: string | null
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  artwork_id: string
  created_at: string
}

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  reporter_id: string | null
  artwork_id: string | null
  artist_id: string | null
  reason: string
  details: string | null
  status: ReportStatus
  admin_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface PaymentEvent {
  id: string
  order_id: string | null
  provider: string
  provider_event_id: string | null
  provider_payment_id: string | null
  amount: number | null
  currency: string
  status: string
  raw_payload: Record<string, unknown>
  processed_at: string | null
  created_at: string
}

export interface ArtistArtwork {
  id: string
  artist_id: string
  title: string
  description: string | null
  category: GiftCategory
  image_url: string
  image_urls: string[]
  price_min: number | null
  price_max: number | null
  tags: string[]
  is_featured: boolean
  is_public: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  approval_notes: string | null
  approved_by_admin_id: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportConversation {
  id: string
  customer_id: string
  subject: string
  status: 'open' | 'closed'
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  is_admin: boolean
  created_at: string
}

export interface ArtworkFeedback {
  id: string
  artwork_id: string
  artist_id: string
  customer_id: string
  rating: number
  title: string | null
  content: string | null
  show_as_testimonial: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown>
  created_at: string
}

// Extended types with relations
export interface RequestWithRelations extends Request {
  customer?: Profile
  assigned_artist?: Profile
  chat_room?: ChatRoom
}

export interface ChatRoomWithRelations extends ChatRoom {
  request?: Request & { category?: GiftCategory; title?: string; status?: RequestStatus }
  customer?: Partial<Profile>
  artist?: Partial<Profile>
  messages?: Message[]
}

export interface MessageWithSender extends Message {
  sender?: Partial<Profile> & { role?: UserRole }
}

export interface OrderWithRelations extends Order {
  request?: Request
  customer?: Profile
  artist?: Profile
  review?: Review
}

export interface ArtistArtworkWithArtist extends ArtistArtwork {
  artist?: Pick<Profile, 'id' | 'avatar_url' | 'bio' | 'specialties' | 'rating' | 'total_reviews' | 'is_available'>
}

export interface ArtworkFeedbackWithRelations extends ArtworkFeedback {
  customer?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  artwork?: Pick<ArtistArtwork, 'id' | 'title' | 'image_url' | 'category'>
}

export interface SupportConversationWithRelations extends SupportConversation {
  customer?: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>
  messages?: SupportMessage[]
}

// Form types
export interface CreateRequestInput {
  title: string
  description: string
  category: GiftCategory
  reference_images?: string[]
  recipient_name?: string
  occasion?: string
  deadline?: string
  budget_min?: number
  budget_max?: number
  assigned_artist_id?: string
  inspiration_artwork_id?: string
}

export interface UpdateProfileInput {
  full_name?: string
  avatar_url?: string
  phone?: string
  customer_preferences?: Record<string, unknown>
  bio?: string
  portfolio_url?: string
  specialties?: GiftCategory[]
  is_available?: boolean
}

export interface SendMessageInput {
  chat_room_id: string
  message_type: MessageType
  content: string
  attachments?: string[]
  quote_amount?: number
  quote_details?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Dashboard stats
export interface CustomerStats {
  totalRequests: number
  activeRequests: number
  completedOrders: number
  pendingMessages: number
}

export interface ArtistStats {
  activeOrders: number
  completedOrders: number
  totalEarnings: number
  averageRating: number
  totalReviews: number
  pendingMessages: number
}

export interface AdminStats {
  pendingRequests: number
  activeOrders: number
  totalRevenue: number
  totalUsers: number
  totalArtists: number
  totalCustomers: number
}

// Helper type for category display
export const CATEGORY_LABELS: Record<GiftCategory, string> = {
  portrait: 'Portrait',
  caricature: 'Caricature',
  illustration: 'Illustration',
  calligraphy: 'Calligraphy',
  custom_jewelry: 'Custom Jewelry',
  woodwork: 'Woodwork',
  pottery: 'Pottery',
  textile: 'Textile',
  digital_art: 'Digital Art',
  other: 'Other',
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  assigned: 'Artist Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid',
  in_progress: 'In Progress',
  preview_shared: 'Preview Shared',
  revision_requested: 'Revision Requested',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  refunded: 'Refunded',
}
