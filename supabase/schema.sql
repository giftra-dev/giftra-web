-- =====================================================
-- GIFTRA DATABASE SCHEMA
-- Complete PostgreSQL schema for Supabase
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'artist', 'admin');

-- Request status flow
CREATE TYPE request_status AS ENUM (
  'pending_review',      -- Customer submitted, waiting for admin
  'approved',            -- Admin approved, waiting for artist assignment
  'assigned',            -- Artist assigned, work not started
  'in_progress',         -- Artist working on it
  'completed',           -- Artist finished, pending customer review
  'delivered',           -- Customer accepted delivery
  'cancelled',           -- Cancelled by any party
  'rejected'             -- Admin rejected the request
);

-- Order status (after payment)
CREATE TYPE order_status AS ENUM (
  'pending_payment',     -- Waiting for customer payment
  'paid',                -- Payment received
  'in_production',       -- Artist working on physical item
  'shipped',             -- Item shipped
  'delivered',           -- Item delivered to customer
  'refunded'             -- Order refunded
);

-- Message types for chat
CREATE TYPE message_type AS ENUM (
  'text',
  'image',
  'file',
  'system',              -- System notifications
  'revision_request',    -- Customer asking for changes
  'approval',            -- Customer approving design
  'quote'                -- Artist sending price quote
);

-- Gift categories
CREATE TYPE gift_category AS ENUM (
  'portrait',
  'caricature',
  'illustration',
  'calligraphy',
  'custom_jewelry',
  'woodwork',
  'pottery',
  'textile',
  'digital_art',
  'other'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  
  -- Artist-specific fields
  bio TEXT,
  portfolio_url TEXT,
  specialties gift_category[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  
  -- Admin fields
  is_super_admin BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift Requests table
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category gift_category NOT NULL,
  reference_images TEXT[] DEFAULT '{}',
  
  -- Recipient info
  recipient_name TEXT,
  occasion TEXT,
  deadline DATE,
  
  -- Pricing
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  quoted_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  
  -- Status tracking
  status request_status NOT NULL DEFAULT 'pending_review',
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Chat Rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  -- Participants (stored for quick access)
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Room settings
  is_active BOOLEAN DEFAULT true,
  admin_can_view BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  
  -- For quotes
  quote_amount DECIMAL(10,2),
  quote_details TEXT,
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (after payment)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  -- Relationships
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Order details
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending_payment',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment info
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Shipping info
  shipping_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  -- Response from artist
  artist_response TEXT,
  artist_responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one review per order
  UNIQUE(order_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (for admin tracking)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Activity details
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Requests indexes
CREATE INDEX idx_requests_customer ON requests(customer_id);
CREATE INDEX idx_requests_artist ON requests(assigned_artist_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_created ON requests(created_at DESC);

-- Chat rooms indexes
CREATE INDEX idx_chat_rooms_request ON chat_rooms(request_id);
CREATE INDEX idx_chat_rooms_customer ON chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_artist ON chat_rooms(artist_id);

-- Messages indexes
CREATE INDEX idx_messages_chat_room ON messages(chat_room_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Orders indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_artist ON orders(artist_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view other profiles (for artist listing, etc.)
CREATE POLICY "Users can view public profile info"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- REQUESTS POLICIES
-- =====================================================

-- Customers can view their own requests
CREATE POLICY "Customers can view own requests"
  ON requests FOR SELECT
  USING (auth.uid() = customer_id);

-- Artists can view assigned requests
CREATE POLICY "Artists can view assigned requests"
  ON requests FOR SELECT
  USING (auth.uid() = assigned_artist_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Customers can create requests
CREATE POLICY "Customers can create requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers can update their pending requests
CREATE POLICY "Customers can update pending requests"
  ON requests FOR UPDATE
  USING (
    auth.uid() = customer_id
    AND status IN ('pending_review', 'approved')
  );

-- Artists can update their assigned requests
CREATE POLICY "Artists can update assigned requests"
  ON requests FOR UPDATE
  USING (
    auth.uid() = assigned_artist_id
    AND status IN ('assigned', 'in_progress')
  );

-- Admins can update any request
CREATE POLICY "Admins can update requests"
  ON requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- CHAT ROOMS POLICIES
-- =====================================================

-- Participants can view their chat rooms
CREATE POLICY "Participants can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() = customer_id
    OR auth.uid() = artist_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can create chat rooms (via function)
CREATE POLICY "System can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Participants can view messages in their chat rooms
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = messages.chat_room_id
      AND (
        chat_rooms.customer_id = auth.uid()
        OR chat_rooms.artist_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = messages.chat_room_id
      AND (
        chat_rooms.customer_id = auth.uid()
        OR chat_rooms.artist_id = auth.uid()
      )
    )
  );

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Customers can view their orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Artists can view their orders
CREATE POLICY "Artists can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = artist_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- REVIEWS POLICIES
-- =====================================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Customers can create reviews for their orders
CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reviews.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'delivered'
    )
  );

-- Artists can respond to reviews
CREATE POLICY "Artists can respond to reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = artist_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- ACTIVITY LOG POLICIES
-- =====================================================

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create chat room when request is approved and artist assigned
CREATE OR REPLACE FUNCTION create_chat_room_on_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create chat room when artist is first assigned
  IF NEW.assigned_artist_id IS NOT NULL 
     AND OLD.assigned_artist_id IS NULL 
     AND NEW.status IN ('assigned', 'in_progress') THEN
    INSERT INTO chat_rooms (request_id, customer_id, artist_id)
    VALUES (NEW.id, NEW.customer_id, NEW.assigned_artist_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_artist_assigned
  AFTER UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_room_on_assignment();

-- Update artist rating when new review is added
CREATE OR REPLACE FUNCTION update_artist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE artist_id = NEW.artist_id;
  
  UPDATE profiles
  SET rating = COALESCE(avg_rating, 0),
      total_reviews = review_count
  WHERE id = NEW.artist_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_rating();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number = 'GFT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_created
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Update chat room last_message_at
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NOW()
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_last_message();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment the following to insert sample data after creating a user via the app

/*
-- Insert sample artists (after they sign up via the app)
UPDATE profiles SET
  role = 'artist',
  bio = 'Professional portrait artist with 10 years of experience.',
  specialties = ARRAY['portrait', 'illustration']::gift_category[],
  is_available = true
WHERE email = 'artist@example.com';

-- Insert sample admin
UPDATE profiles SET
  role = 'admin',
  is_super_admin = true
WHERE email = 'admin@example.com';
*/
