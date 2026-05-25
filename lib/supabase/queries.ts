import { createClient } from '@/lib/supabase/client'
import type {
  Profile,
  Request,
  ChatRoom,
  Message,
  Order,
  Notification,
  CreateRequestInput,
  UpdateProfileInput,
  SendMessageInput,
  RequestWithRelations,
  ChatRoomWithRelations,
  MessageWithSender,
  UserRole,
  RequestStatus,
  GiftCategory,
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
    .update(updates)
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

// =====================================================
// REQUEST FUNCTIONS
// =====================================================

export async function createRequest(
  customerId: string,
  input: CreateRequestInput
): Promise<{ data: Request | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('requests')
    .insert({
      customer_id: customerId,
      ...input,
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
    .update({ status, ...additionalFields })
    .eq('id', requestId)
    .select()
    .single()
  
  return { data, error: error as Error | null }
}

export async function assignArtist(
  requestId: string,
  artistId: string,
  adminId: string
): Promise<{ data: Request | null; error: Error | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('requests')
    .update({
      assigned_artist_id: artistId,
      approved_by_admin_id: adminId,
      status: 'assigned',
      approved_at: new Date().toISOString(),
      assigned_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single()
  
  return { data, error: error as Error | null }
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

export async function getChatRoomByRequest(
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
      request:requests(id, title, status),
      customer:profiles!chat_rooms_customer_id_fkey(id, full_name, avatar_url),
      artist:profiles!chat_rooms_artist_id_fkey(id, full_name, avatar_url)
    `)
    .eq(column, userId)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })
  
  return (data || []) as ChatRoomWithRelations[]
}

export async function getMessages(
  chatRoomId: string,
  limit: number = 50,
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
      ...input,
      sender_id: user.id,
    })
    .select()
    .single()
  
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

// =====================================================
// ORDER FUNCTIONS
// =====================================================

export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  
  return data
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function getArtistOrders(artistId: string): Promise<Order[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
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
