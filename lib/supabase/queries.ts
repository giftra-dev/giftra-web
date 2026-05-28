import { createClient } from '@/lib/supabase/client'
import type {
  Profile,
  Request,
  ChatRoom,
  Message,
  Order,
  Notification,
  Review,
  CreateRequestInput,
  UpdateProfileInput,
  SendMessageInput,
  RequestWithRelations,
  ChatRoomWithRelations,
  MessageWithSender,
  OrderWithRelations,
  UserRole,
  RequestStatus,
  GiftCategory,
  OrderStatus,
} from '@/lib/types/database'

// =====================================================
// AUTH FUNCTIONS
// =====================================================

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'customer'
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data
}

// =====================================================
// PROFILE FUNCTIONS
// =====================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return data
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<{ data: Profile | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

export async function getArtists(
  category?: GiftCategory
): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'artist')
    .eq('is_available', true)
  
  if (category) {
    query = query.contains('specialties', [category])
  }
  
  const { data } = await query.order('rating', { ascending: false })
  return data || []
}

export async function getAllArtists(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'artist')
    .order('rating', { ascending: false })
  
  return data || []
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'role' | 'bio' | 'portfolio_url' | 'specialties' | 'is_available' | 'is_super_admin'>>
): Promise<{ data: Profile | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  return { data, error: error as Error | null }
}

// =====================================================
// REQUEST FUNCTIONS
// =====================================================

export async function createRequest(
  input: CreateRequestInput
): Promise<{ data: Request | null; error: Error | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const { data, error } = await supabase
    .from('requests')
    .insert({
      customer_id: user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      reference_images: input.reference_images || [],
      recipient_name: input.recipient_name,
      occasion: input.occasion,
      deadline: input.deadline,
      budget_min: input.budget_min,
      budget_max: input.budget_max,
      status: 'pending_review',
    })
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

export async function getRequest(
  requestId: string
): Promise<RequestWithRelations | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      customer:profiles!requests_customer_id_fkey(*),
      assigned_artist:profiles!requests_assigned_artist_id_fkey(*)
    `)
    .eq('id', requestId)
    .single()
  
  return data as RequestWithRelations | null
}

export async function getCustomerRequests(
  customerId: string
): Promise<RequestWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      assigned_artist:profiles!requests_assigned_artist_id_fkey(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  return (data || []) as RequestWithRelations[]
}

export async function getArtistRequests(
  artistId: string
): Promise<RequestWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      customer:profiles!requests_customer_id_fkey(*)
    `)
    .eq('assigned_artist_id', artistId)
    .order('created_at', { ascending: false })
  
  return (data || []) as RequestWithRelations[]
}

export async function getPendingRequests(): Promise<RequestWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      customer:profiles!requests_customer_id_fkey(*)
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
  
  return (data || []) as RequestWithRelations[]
}

export async function getAllRequests(): Promise<RequestWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      customer:profiles!requests_customer_id_fkey(*),
      assigned_artist:profiles!requests_assigned_artist_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
  
  return (data || []) as RequestWithRelations[]
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  additionalFields?: Partial<Request>
): Promise<{ data: Request | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('requests')
    .update({ status, ...additionalFields, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

export async function assignArtist(
  requestId: string,
  artistId: string,
  quotedPrice: number
): Promise<{ data: Request | null; error: Error | null; chatRoom?: ChatRoom }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  // Update request
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .update({
      assigned_artist_id: artistId,
      approved_by_admin_id: user.id,
      quoted_price: quotedPrice,
      status: 'assigned',
      approved_at: new Date().toISOString(),
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('*, customer:profiles!requests_customer_id_fkey(*)')
    .single()
  
  if (requestError) {
    return { data: null, error: requestError as Error }
  }

  // Create chat room
  const { data: chatRoom, error: chatError } = await supabase
    .from('chat_rooms')
    .insert({
      request_id: requestId,
      customer_id: request.customer_id,
      artist_id: artistId,
      is_active: true,
      admin_can_view: true,
    })
    .select()
    .single()

  if (chatError) {
    console.error('Failed to create chat room:', chatError)
  }

  // Create notification for customer
  await supabase.from('notifications').insert({
    user_id: request.customer_id,
    title: 'Artist Assigned',
    message: `An artist has been assigned to your request "${request.title}". Please proceed with payment to start the collaboration.`,
    link: `/customer/request/${requestId}`,
  })

  // Create notification for artist
  await supabase.from('notifications').insert({
    user_id: artistId,
    title: 'New Assignment',
    message: `You have been assigned to a new request: "${request.title}". The customer will pay soon to start collaboration.`,
    link: `/artist/orders`,
  })

  return { data: request, error: null, chatRoom }
}

export async function rejectRequest(
  requestId: string,
  reason: string
): Promise<{ data: Request | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()
  
  if (data) {
    // Notify customer
    await supabase.from('notifications').insert({
      user_id: data.customer_id,
      title: 'Request Rejected',
      message: `Your request "${data.title}" has been rejected. Reason: ${reason}`,
      link: `/customer/requests`,
    })
  }

  return { data, error: error as Error | null }
}

// =====================================================
// ORDER FUNCTIONS
// =====================================================

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GFT-${timestamp}-${random}`
}

export async function createOrder(
  requestId: string,
  paymentIntentId?: string
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = createClient()
  
  // Get request details
  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .single()
  
  if (!request || !request.assigned_artist_id || !request.quoted_price) {
    return { data: null, error: new Error('Request not ready for order') }
  }

  const subtotal = request.quoted_price
  const platformFee = Math.round(subtotal * 0.15 * 100) / 100 // 15% platform fee
  const total = subtotal + platformFee

  const { data, error } = await supabase
    .from('orders')
    .insert({
      request_id: requestId,
      customer_id: request.customer_id,
      artist_id: request.assigned_artist_id,
      order_number: generateOrderNumber(),
      status: paymentIntentId ? 'paid' : 'awaiting_payment',
      subtotal,
      platform_fee: platformFee,
      total,
      payment_intent_id: paymentIntentId,
      paid_at: paymentIntentId ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (data && paymentIntentId) {
    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'in_progress', final_price: total, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    // Notify artist
    await supabase.from('notifications').insert({
      user_id: request.assigned_artist_id,
      title: 'Payment Received',
      message: `Payment received for order ${data.order_number}. You can now start working on the project.`,
      link: `/artist/orders`,
    })

    // Add system message to chat
    const { data: chatRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('request_id', requestId)
      .single()

    if (chatRoom) {
      await supabase.from('messages').insert({
        chat_room_id: chatRoom.id,
        sender_id: request.customer_id,
        message_type: 'system',
        content: 'Payment received. Chat is now active!',
      })
    }
  }
  
  return { data, error: error as Error | null }
}

export async function getOrder(orderId: string): Promise<OrderWithRelations | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(*),
      customer:profiles!orders_customer_id_fkey(*),
      artist:profiles!orders_artist_id_fkey(*)
    `)
    .eq('id', orderId)
    .single()
  
  return data as OrderWithRelations | null
}

export async function getOrderByRequestId(requestId: string): Promise<Order | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('request_id', requestId)
    .single()
  
  return data
}

export async function getCustomerOrders(customerId: string): Promise<OrderWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(*),
      artist:profiles!orders_artist_id_fkey(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  return (data || []) as OrderWithRelations[]
}

export async function getCustomerOrderByRequestId(
  requestId: string,
  customerId: string
): Promise<OrderWithRelations | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(*),
      artist:profiles!orders_artist_id_fkey(*),
      review:reviews(*)
    `)
    .eq('request_id', requestId)
    .eq('customer_id', customerId)
    .maybeSingle()

  return data as OrderWithRelations | null
}

export async function getArtistOrders(artistId: string): Promise<OrderWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(*),
      customer:profiles!orders_customer_id_fkey(*)
    `)
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  
  return (data || []) as OrderWithRelations[]
}

export async function getAllOrders(): Promise<OrderWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(*),
      customer:profiles!orders_customer_id_fkey(*),
      artist:profiles!orders_artist_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
  
  return (data || []) as OrderWithRelations[]
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  additionalFields?: Partial<Order>
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status, ...additionalFields, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

export async function updateOrderAndRequestStatus(
  orderId: string,
  requestId: string,
  orderStatus: OrderStatus,
  requestStatus?: RequestStatus,
  additionalFields?: Partial<Order>
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await updateOrderStatus(orderId, orderStatus, additionalFields)

  if (!error && requestStatus) {
    await supabase
      .from('requests')
      .update({
        status: requestStatus,
        completed_at: requestStatus === 'completed' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
  }

  return { data, error }
}

export async function uploadFileToStorage(
  bucket: 'reference-images' | 'order-artwork',
  path: string,
  file: File
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    return { url: null, path: null, error: error as Error }
  }

  const { data: signed } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 60 * 60 * 24 * 7)

  return { url: signed?.signedUrl || null, path: data.path, error: null }
}

export async function markOrderPaid(
  orderId: string,
  paymentIntentId: string
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (order) {
    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', order.request_id)

    // Notify artist
    await supabase.from('notifications').insert({
      user_id: order.artist_id,
      title: 'Payment Received',
      message: `Payment received for order ${order.order_number}. You can now start working!`,
      link: `/artist/orders`,
    })
  }

  return { data: order, error: error as Error | null }
}

// =====================================================
// CHAT FUNCTIONS
// =====================================================

export async function getChatRoom(
  chatRoomId: string
): Promise<ChatRoomWithRelations | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      request:requests(*),
      customer:profiles!chat_rooms_customer_id_fkey(*),
      artist:profiles!chat_rooms_artist_id_fkey(*)
    `)
    .eq('id', chatRoomId)
    .single()
  
  return data as ChatRoomWithRelations | null
}

export async function getChatRoomByRequestId(
  requestId: string
): Promise<ChatRoom | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('request_id', requestId)
    .single()
  
  return data
}

export async function getUserChatRooms(
  userId: string,
  role: UserRole
): Promise<ChatRoomWithRelations[]> {
  const supabase = createClient()
  const column = role === 'customer' ? 'customer_id' : 'artist_id'
  
  const { data } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      request:requests(id, title, status, category),
      customer:profiles!chat_rooms_customer_id_fkey(id, full_name, avatar_url),
      artist:profiles!chat_rooms_artist_id_fkey(id, full_name, avatar_url)
    `)
    .eq(column, userId)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })
  
  return (data || []) as ChatRoomWithRelations[]
}

export async function getAllChatRooms(): Promise<ChatRoomWithRelations[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      request:requests(id, title, status, category),
      customer:profiles!chat_rooms_customer_id_fkey(id, full_name, avatar_url),
      artist:profiles!chat_rooms_artist_id_fkey(id, full_name, avatar_url)
    `)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })
  
  return (data || []) as ChatRoomWithRelations[]
}

export async function getMessages(
  chatRoomId: string,
  limit: number = 100,
  offset: number = 0
): Promise<MessageWithSender[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)
  
  return (data || []) as MessageWithSender[]
}

export async function sendMessage(
  input: SendMessageInput
): Promise<{ data: Message | null; error: Error | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_room_id: input.chat_room_id,
      sender_id: user.id,
      message_type: input.message_type,
      content: input.content,
      attachments: input.attachments || [],
      quote_amount: input.quote_amount,
      quote_details: input.quote_details,
    })
    .select()
    .single()

  // Update chat room last_message_at
  if (data) {
    await supabase
      .from('chat_rooms')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', input.chat_room_id)
  }
  
  return { data, error: error as Error | null }
}

export async function markMessagesAsRead(
  chatRoomId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', userId)
    .eq('is_read', false)
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .eq('is_read', false)
  
  return count || 0
}

// =====================================================
// REVIEW FUNCTIONS
// =====================================================

export async function createReview(
  orderId: string,
  rating: number,
  title?: string,
  content?: string
): Promise<{ data: Review | null; error: Error | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    return { data: null, error: new Error('Order not found') }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      order_id: orderId,
      customer_id: user.id,
      artist_id: order.artist_id,
      rating,
      title,
      content,
    })
    .select()
    .single()

  // Update artist rating
  if (data) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('artist_id', order.artist_id)
    
    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await supabase
        .from('profiles')
        .update({ rating: avgRating, total_reviews: reviews.length })
        .eq('id', order.artist_id)
    }
  }

  return { data, error: error as Error | null }
}

export async function getArtistReviews(artistId: string): Promise<Review[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  
  return data || []
}

// =====================================================
// NOTIFICATION FUNCTIONS
// =====================================================

export async function getNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
  
  if (unreadOnly) {
    query = query.eq('is_read', false)
  }
  
  const { data } = await query.order('created_at', { ascending: false })
  return data || []
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  return count || 0
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<{ data: Notification | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, message, link })
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

// =====================================================
// STATS FUNCTIONS
// =====================================================

export async function getCustomerStats(customerId: string) {
  const supabase = createClient()
  
  const [requestsResult, ordersResult] = await Promise.all([
    supabase
      .from('requests')
      .select('status')
      .eq('customer_id', customerId),
    supabase
      .from('orders')
      .select('status')
      .eq('customer_id', customerId),
  ])

  const requests = requestsResult.data || []
  const orders = ordersResult.data || []

  return {
    totalRequests: requests.length,
    activeRequests: requests.filter(r => !['completed', 'cancelled', 'rejected'].includes(r.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    pendingMessages: 0, // Will be calculated separately
  }
}

export async function getArtistStats(artistId: string) {
  const supabase = createClient()
  
  const [ordersResult, profileResult] = await Promise.all([
    supabase
      .from('orders')
      .select('status, subtotal')
      .eq('artist_id', artistId),
    supabase
      .from('profiles')
      .select('rating, total_reviews')
      .eq('id', artistId)
      .single(),
  ])

  const orders = ordersResult.data || []
  const profile = profileResult.data

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.subtotal * 0.85), 0) // 85% to artist

  return {
    activeOrders: orders.filter(o => !['completed', 'refunded'].includes(o.status)).length,
    completedOrders: completedOrders.length,
    totalEarnings,
    averageRating: profile?.rating || 0,
    totalReviews: profile?.total_reviews || 0,
    pendingMessages: 0,
  }
}

export async function getAdminStats() {
  const supabase = createClient()
  
  const [requestsResult, ordersResult, usersResult] = await Promise.all([
    supabase.from('requests').select('status'),
    supabase.from('orders').select('status, total'),
    supabase.from('profiles').select('role'),
  ])

  const requests = requestsResult.data || []
  const orders = ordersResult.data || []
  const users = usersResult.data || []

  const totalRevenue = orders
    .filter(o => ['paid', 'in_progress', 'preview_shared', 'ready_to_ship', 'shipped', 'delivered', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + (o.total * 0.15), 0) // 15% platform fee

  return {
    pendingRequests: requests.filter(r => r.status === 'pending_review').length,
    activeOrders: orders.filter(o => !['completed', 'refunded'].includes(o.status)).length,
    totalRevenue,
    totalUsers: users.length,
    totalArtists: users.filter(u => u.role === 'artist').length,
    totalCustomers: users.filter(u => u.role === 'customer').length,
  }
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export function subscribeToMessages(
  chatRoomId: string,
  callback: (message: Message) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`messages:${chatRoomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${chatRoomId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()
}

export function subscribeToRequestUpdates(
  requestId: string,
  callback: (request: Request) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`request:${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'requests',
        filter: `id=eq.${requestId}`,
      },
      (payload) => {
        callback(payload.new as Request)
      }
    )
    .subscribe()
}

export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: Order) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new as Order)
      }
    )
    .subscribe()
}
