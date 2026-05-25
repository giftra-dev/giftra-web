import { create } from 'zustand'

// Types
export type UserRole = 'customer' | 'artist' | 'admin'

export type OrderStatus = 
  | 'draft'
  | 'awaiting_payment'
  | 'in_progress'
  | 'preview_shared'
  | 'revision_requested'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'refunded'

export type RequestStatus = 
  | 'pending'
  | 'admin_review'
  | 'artist_assigned'
  | 'awaiting_payment'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type ChatStatus = 
  | 'admin_review'
  | 'artist_assigned'
  | 'artist_chat_active'
  | 'in_progress'
  | 'paused'
  | 'completed'

export type MessageType = 'text' | 'image' | 'system' | 'file'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface ArtistProfile extends User {
  specialties: string[]
  rating: number
  completedOrders: number
  bio: string
}

export interface GiftRequest {
  id: string
  customerId: string
  category: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: Date
  referenceImages: string[]
  status: RequestStatus
  assignedArtistId?: string
  adminPrice?: number
  createdAt: Date
}

export interface Order {
  id: string
  requestId: string
  customerId: string
  artistId: string
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  chatRoomId: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  chatRoomId: string
  senderId: string
  senderRole: UserRole
  type: MessageType
  content: string
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  isRead: boolean
  createdAt: Date
}

export interface ChatRoom {
  id: string
  requestId: string
  orderId?: string
  customerId: string
  artistId?: string
  status: ChatStatus
  isLocked: boolean
  lockReason?: string
  createdAt: Date
  lastMessageAt: Date
}

// Mock Data
const mockUsers: User[] = [
  { id: 'customer-1', email: 'john@example.com', name: 'John Doe', role: 'customer', createdAt: new Date() },
  { id: 'artist-1', email: 'sarah@example.com', name: 'Sarah Artist', role: 'artist', createdAt: new Date() },
  { id: 'artist-2', email: 'mike@example.com', name: 'Mike Creative', role: 'artist', createdAt: new Date() },
  { id: 'admin-1', email: 'admin@giftra.com', name: 'Admin User', role: 'admin', createdAt: new Date() },
]

const mockArtistProfiles: ArtistProfile[] = [
  { 
    ...mockUsers[1], 
    specialties: ['Portrait', 'Caricature', 'Digital Art'], 
    rating: 4.9, 
    completedOrders: 156, 
    bio: 'Specializing in personalized portraits and digital illustrations.' 
  },
  { 
    ...mockUsers[2], 
    specialties: ['Custom Jewelry', 'Engraving', '3D Printing'], 
    rating: 4.7, 
    completedOrders: 89, 
    bio: 'Creating unique personalized jewelry and custom engravings.' 
  },
]

const mockRequests: GiftRequest[] = [
  {
    id: 'req-1',
    customerId: 'customer-1',
    category: 'Portrait',
    description: 'Family portrait with 4 people, watercolor style, warm colors',
    budgetMin: 150,
    budgetMax: 300,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    referenceImages: [],
    status: 'in_progress',
    assignedArtistId: 'artist-1',
    adminPrice: 200,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'req-2',
    customerId: 'customer-1',
    category: 'Custom Jewelry',
    description: 'Engraved pendant with initials J+M, silver, heart shape',
    budgetMin: 80,
    budgetMax: 150,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    referenceImages: [],
    status: 'admin_review',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'req-3',
    customerId: 'customer-1',
    category: 'Digital Art',
    description: 'Pet portrait - Golden Retriever, cartoon style',
    budgetMin: 50,
    budgetMax: 100,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    referenceImages: [],
    status: 'pending',
    createdAt: new Date(),
  },
]

const mockChatRooms: ChatRoom[] = [
  {
    id: 'chat-1',
    requestId: 'req-1',
    orderId: 'order-1',
    customerId: 'customer-1',
    artistId: 'artist-1',
    status: 'in_progress',
    isLocked: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    chatRoomId: 'chat-1',
    senderId: 'system',
    senderRole: 'admin',
    type: 'system',
    content: 'Artist assigned to your request',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-2',
    chatRoomId: 'chat-1',
    senderId: 'system',
    senderRole: 'admin',
    type: 'system',
    content: 'Payment received successfully',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-3',
    chatRoomId: 'chat-1',
    senderId: 'artist-1',
    senderRole: 'artist',
    type: 'text',
    content: 'Hi John! I am excited to work on your family portrait. Could you share some reference photos of your family members?',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
  },
  {
    id: 'msg-4',
    chatRoomId: 'chat-1',
    senderId: 'customer-1',
    senderRole: 'customer',
    type: 'text',
    content: 'Hi Sarah! Thank you so much. Here are some photos of our family. We would like a warm, cozy feel to the portrait.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-5',
    chatRoomId: 'chat-1',
    senderId: 'artist-1',
    senderRole: 'artist',
    type: 'text',
    content: 'Perfect! I have started working on the initial sketch. I will share a preview soon.',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const mockOrders: Order[] = [
  {
    id: 'order-1',
    requestId: 'req-1',
    customerId: 'customer-1',
    artistId: 'artist-1',
    status: 'in_progress',
    totalAmount: 200,
    paidAmount: 200,
    chatRoomId: 'chat-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

// Store
interface GiftraStore {
  // Auth State
  currentUser: User | null
  isAuthenticated: boolean
  
  // Data
  users: User[]
  artistProfiles: ArtistProfile[]
  requests: GiftRequest[]
  orders: Order[]
  chatRooms: ChatRoom[]
  messages: Message[]
  
  // Actions
  login: (role: UserRole) => void
  logout: () => void
  
  // Request Actions
  createRequest: (request: Omit<GiftRequest, 'id' | 'customerId' | 'status' | 'createdAt'>) => void
  updateRequestStatus: (requestId: string, status: RequestStatus) => void
  assignArtist: (requestId: string, artistId: string, price: number) => void
  
  // Order Actions
  createOrder: (requestId: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  
  // Chat Actions
  sendMessage: (chatRoomId: string, content: string, type?: MessageType, imageUrl?: string) => void
  markMessagesRead: (chatRoomId: string) => void
  
  // Helpers
  getRequestById: (id: string) => GiftRequest | undefined
  getChatRoomByRequestId: (requestId: string) => ChatRoom | undefined
  getMessagesByChatRoom: (chatRoomId: string) => Message[]
  getOrderByRequestId: (requestId: string) => Order | undefined
}

export const useGiftraStore = create<GiftraStore>((set, get) => ({
  // Initial State
  currentUser: null,
  isAuthenticated: false,
  users: mockUsers,
  artistProfiles: mockArtistProfiles,
  requests: mockRequests,
  orders: mockOrders,
  chatRooms: mockChatRooms,
  messages: mockMessages,
  
  // Auth
  login: (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role)
    if (user) {
      set({ currentUser: user, isAuthenticated: true })
    }
  },
  
  logout: () => {
    set({ currentUser: null, isAuthenticated: false })
  },
  
  // Request Actions
  createRequest: (requestData) => {
    const { currentUser, requests } = get()
    if (!currentUser) return
    
    const newRequest: GiftRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      customerId: currentUser.id,
      status: 'pending',
      createdAt: new Date(),
    }
    
    set({ requests: [...requests, newRequest] })
  },
  
  updateRequestStatus: (requestId, status) => {
    set(state => ({
      requests: state.requests.map(r => 
        r.id === requestId ? { ...r, status } : r
      )
    }))
  },
  
  assignArtist: (requestId, artistId, price) => {
    const { chatRooms, messages, requests } = get()
    
    // Update request
    set({
      requests: requests.map(r => 
        r.id === requestId 
          ? { ...r, status: 'artist_assigned' as RequestStatus, assignedArtistId: artistId, adminPrice: price }
          : r
      )
    })
    
    const request = requests.find(r => r.id === requestId)
    if (!request) return
    
    // Create chat room
    const newChatRoom: ChatRoom = {
      id: `chat-${Date.now()}`,
      requestId,
      customerId: request.customerId,
      artistId,
      status: 'artist_assigned',
      isLocked: true,
      lockReason: 'Chat will unlock after payment is completed',
      createdAt: new Date(),
      lastMessageAt: new Date(),
    }
    
    // Create system message
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      chatRoomId: newChatRoom.id,
      senderId: 'system',
      senderRole: 'admin',
      type: 'system',
      content: 'Artist assigned to your request',
      isRead: false,
      createdAt: new Date(),
    }
    
    set({
      chatRooms: [...chatRooms, newChatRoom],
      messages: [...messages, systemMessage],
    })
  },
  
  // Order Actions
  createOrder: (requestId) => {
    const { requests, chatRooms, orders, messages } = get()
    const request = requests.find(r => r.id === requestId)
    const chatRoom = chatRooms.find(c => c.requestId === requestId)
    
    if (!request || !chatRoom || !request.adminPrice || !request.assignedArtistId) return
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      requestId,
      customerId: request.customerId,
      artistId: request.assignedArtistId,
      status: 'in_progress',
      totalAmount: request.adminPrice,
      paidAmount: request.adminPrice,
      chatRoomId: chatRoom.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // System message for payment
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      chatRoomId: chatRoom.id,
      senderId: 'system',
      senderRole: 'admin',
      type: 'system',
      content: 'Payment received successfully',
      isRead: false,
      createdAt: new Date(),
    }
    
    set({
      orders: [...orders, newOrder],
      requests: requests.map(r => r.id === requestId ? { ...r, status: 'in_progress' as RequestStatus } : r),
      chatRooms: chatRooms.map(c => 
        c.id === chatRoom.id 
          ? { ...c, orderId: newOrder.id, status: 'artist_chat_active' as ChatStatus, isLocked: false, lockReason: undefined }
          : c
      ),
      messages: [...messages, systemMessage],
    })
  },
  
  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
      )
    }))
  },
  
  // Chat Actions
  sendMessage: (chatRoomId, content, type = 'text', imageUrl) => {
    const { currentUser, messages, chatRooms } = get()
    if (!currentUser) return
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatRoomId,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      type,
      content,
      imageUrl,
      isRead: false,
      createdAt: new Date(),
    }
    
    set({
      messages: [...messages, newMessage],
      chatRooms: chatRooms.map(c => 
        c.id === chatRoomId ? { ...c, lastMessageAt: new Date() } : c
      ),
    })
  },
  
  markMessagesRead: (chatRoomId) => {
    set(state => ({
      messages: state.messages.map(m => 
        m.chatRoomId === chatRoomId ? { ...m, isRead: true } : m
      )
    }))
  },
  
  // Helpers
  getRequestById: (id) => get().requests.find(r => r.id === id),
  getChatRoomByRequestId: (requestId) => get().chatRooms.find(c => c.requestId === requestId),
  getMessagesByChatRoom: (chatRoomId) => get().messages.filter(m => m.chatRoomId === chatRoomId),
  getOrderByRequestId: (requestId) => get().orders.find(o => o.requestId === requestId),
}))
