-- Giftra complete database reset and production schema
-- WARNING: Running this file deletes the Giftra application tables, policies,
-- triggers, functions, and enums in the public schema, then recreates them.
-- It does not delete auth.users, but profile rows are recreated from auth users.
-- Run only after taking a backup.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Reset application objects
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_artist_rating() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_artist_rating() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.assign_artist_and_price(UUID, UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.assign_artist_and_price(UUID, UUID, NUMERIC, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.record_payment_and_unlock_chat(UUID, TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.transition_order(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.send_chat_message(UUID, TEXT, TEXT, JSONB) CASCADE;

DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payment_events CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.artist_artworks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.message_type CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.request_status CASCADE;
DROP TYPE IF EXISTS public.gift_category CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('customer', 'artist', 'admin');

CREATE TYPE public.gift_category AS ENUM (
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

CREATE TYPE public.request_status AS ENUM (
  'pending_review',
  'approved',
  'assigned',
  'in_progress',
  'completed',
  'delivered',
  'cancelled',
  'rejected'
);

CREATE TYPE public.order_status AS ENUM (
  'draft',
  'awaiting_payment',
  'paid',
  'in_progress',
  'preview_shared',
  'revision_requested',
  'ready_to_ship',
  'shipped',
  'delivered',
  'completed',
  'refunded'
);

CREATE TYPE public.message_type AS ENUM (
  'text',
  'image',
  'file',
  'system',
  'revision_request',
  'approval',
  'quote'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'customer',
  bio TEXT,
  portfolio_url TEXT,
  specialties public.gift_category[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.artist_artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.gift_category NOT NULL,
  image_url TEXT NOT NULL,
  price_min NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_min >= 0),
  price_max NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_max >= price_min),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  preferred_artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  inspiration_artwork_id UUID REFERENCES public.artist_artworks(id) ON DELETE SET NULL,
  approved_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.gift_category NOT NULL,
  reference_images TEXT[] NOT NULL DEFAULT '{}',
  recipient_name TEXT,
  occasion TEXT,
  deadline DATE,
  budget_min NUMERIC(10,2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max NUMERIC(10,2) CHECK (budget_max IS NULL OR budget_max >= COALESCE(budget_min, 0)),
  quoted_price NUMERIC(10,2) CHECK (quoted_price IS NULL OR quoted_price >= 0),
  final_price NUMERIC(10,2) CHECK (final_price IS NULL OR final_price >= 0),
  status public.request_status NOT NULL DEFAULT 'pending_review',
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL UNIQUE REFERENCES public.requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  admin_can_view BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type public.message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  quote_amount NUMERIC(10,2) CHECK (quote_amount IS NULL OR quote_amount >= 0),
  quote_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL UNIQUE REFERENCES public.requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE DEFAULT ('GFT-' || UPPER(SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', ''), 1, 10))),
  status public.order_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  shipping_address JSONB NOT NULL DEFAULT '{}'::JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  artist_response TEXT,
  artist_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES public.artist_artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, artwork_id)
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  artwork_id UUID REFERENCES public.artist_artworks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_event_id TEXT,
  provider_payment_id TEXT,
  amount NUMERIC(10,2) CHECK (amount IS NULL OR amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_artist_available_idx ON public.profiles(role, is_available) WHERE role = 'artist';
CREATE INDEX artist_artworks_artist_idx ON public.artist_artworks(artist_id);
CREATE INDEX artist_artworks_category_idx ON public.artist_artworks(category);
CREATE INDEX artist_artworks_public_featured_idx ON public.artist_artworks(is_public, is_featured);
CREATE INDEX requests_customer_idx ON public.requests(customer_id);
CREATE INDEX requests_artist_idx ON public.requests(assigned_artist_id);
CREATE INDEX requests_status_idx ON public.requests(status);
CREATE INDEX chat_rooms_customer_idx ON public.chat_rooms(customer_id);
CREATE INDEX chat_rooms_artist_idx ON public.chat_rooms(artist_id);
CREATE INDEX messages_room_created_idx ON public.messages(chat_room_id, created_at DESC);
CREATE INDEX orders_customer_idx ON public.orders(customer_id);
CREATE INDEX orders_artist_idx ON public.orders(artist_id);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX reviews_artist_idx ON public.reviews(artist_id);
CREATE INDEX wishlist_items_user_idx ON public.wishlist_items(user_id, created_at DESC);
CREATE INDEX wishlist_items_artwork_idx ON public.wishlist_items(artwork_id);
CREATE INDEX reports_status_idx ON public.reports(status, created_at DESC);
CREATE INDEX reports_artwork_idx ON public.reports(artwork_id);
CREATE INDEX payment_events_order_idx ON public.payment_events(order_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX activity_log_created_idx ON public.activity_log(created_at DESC);

-- ---------------------------------------------------------------------------
-- Utility functions and triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_artist_artworks_updated_at
BEFORE UPDATE ON public.artist_artworks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

  IF requested_role NOT IN ('customer', 'artist', 'admin') THEN
    requested_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    requested_role::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.refresh_artist_rating(p_artist_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM public.reviews
      WHERE artist_id = p_artist_id
    ), 0),
    total_reviews = (
      SELECT COUNT(*)::INTEGER
      FROM public.reviews
      WHERE artist_id = p_artist_id
    ),
    updated_at = NOW()
  WHERE id = p_artist_id
    AND role = 'artist';
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_artist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_artist_rating(OLD.artist_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_artist_rating(NEW.artist_id);

  IF TG_OP = 'UPDATE' AND OLD.artist_id <> NEW.artist_id THEN
    PERFORM public.refresh_artist_rating(OLD.artist_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_refresh_artist_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_artist_rating();

CREATE OR REPLACE FUNCTION public.touch_chat_room_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_touch_chat_room
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_room_last_message();

-- ---------------------------------------------------------------------------
-- Production workflow RPCs used by the app/server helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_artist_and_price(
  p_gift_request_id UUID,
  p_artist_id UUID,
  p_final_price NUMERIC,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.requests;
  v_order public.orders;
  v_room public.chat_rooms;
  v_platform_fee NUMERIC(10,2);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can assign artists';
  END IF;

  SELECT * INTO v_request
  FROM public.requests
  WHERE id = p_gift_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  v_platform_fee := ROUND((p_final_price * 0.10)::NUMERIC, 2);

  UPDATE public.requests
  SET
    assigned_artist_id = p_artist_id,
    approved_by_admin_id = auth.uid(),
    final_price = p_final_price,
    quoted_price = p_final_price,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    status = 'assigned',
    approved_at = COALESCE(approved_at, NOW()),
    assigned_at = NOW()
  WHERE id = p_gift_request_id;

  INSERT INTO public.chat_rooms (request_id, customer_id, artist_id, is_active)
  VALUES (p_gift_request_id, v_request.customer_id, p_artist_id, FALSE)
  ON CONFLICT (request_id) DO UPDATE SET
    artist_id = EXCLUDED.artist_id,
    is_active = FALSE
  RETURNING * INTO v_room;

  INSERT INTO public.orders (
    request_id,
    customer_id,
    artist_id,
    status,
    subtotal,
    platform_fee,
    total
  )
  VALUES (
    p_gift_request_id,
    v_request.customer_id,
    p_artist_id,
    'awaiting_payment',
    p_final_price,
    v_platform_fee,
    p_final_price + v_platform_fee
  )
  ON CONFLICT (request_id) DO UPDATE SET
    artist_id = EXCLUDED.artist_id,
    status = 'awaiting_payment',
    subtotal = EXCLUDED.subtotal,
    platform_fee = EXCLUDED.platform_fee,
    total = EXCLUDED.total,
    updated_at = NOW()
  RETURNING * INTO v_order;

  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES
    (v_request.customer_id, 'Your custom gift quote is ready', 'Review the quote and complete payment to unlock chat.', '/customer/requests/' || p_gift_request_id),
    (p_artist_id, 'A new order was assigned to you', 'The customer can chat after payment is completed.', '/artist/orders');

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_payment_and_unlock_chat(
  p_order_id UUID,
  p_provider_payment_id TEXT,
  p_amount NUMERIC
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF auth.uid() <> v_order.customer_id AND NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not allowed to record this payment';
  END IF;

  IF p_amount < v_order.total THEN
    RAISE EXCEPTION 'Payment amount is lower than order total';
  END IF;

  UPDATE public.orders
  SET
    status = 'paid',
    payment_intent_id = p_provider_payment_id,
    paid_at = NOW()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  UPDATE public.requests
  SET status = 'in_progress'
  WHERE id = v_order.request_id;

  UPDATE public.chat_rooms
  SET is_active = TRUE
  WHERE request_id = v_order.request_id;

  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES
    (v_order.artist_id, 'Payment received', 'Chat is now open for this order.', '/artist/orders'),
    (v_order.customer_id, 'Payment confirmed', 'You can now chat with the artist.', '/messages');

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_order(
  p_order_id UUID,
  p_to_status TEXT
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_status public.order_status;
BEGIN
  v_status := p_to_status::public.order_status;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF auth.uid() NOT IN (v_order.customer_id, v_order.artist_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed to update this order';
  END IF;

  UPDATE public.orders
  SET
    status = v_status,
    shipped_at = CASE WHEN v_status = 'shipped' THEN COALESCE(shipped_at, NOW()) ELSE shipped_at END,
    delivered_at = CASE WHEN v_status IN ('delivered', 'completed') THEN COALESCE(delivered_at, NOW()) ELSE delivered_at END
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  IF v_status IN ('delivered', 'completed') THEN
    UPDATE public.requests
    SET status = 'delivered', completed_at = COALESCE(completed_at, NOW())
    WHERE id = v_order.request_id;
  END IF;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_chat_message(
  p_chat_room_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_attachments JSONB DEFAULT '[]'::JSONB
)
RETURNS public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room public.chat_rooms;
  v_message public.messages;
  v_attachments TEXT[];
BEGIN
  SELECT * INTO v_room
  FROM public.chat_rooms
  WHERE id = p_chat_room_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat room not found';
  END IF;

  IF NOT v_room.is_active AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chat is locked until payment is completed';
  END IF;

  IF auth.uid() NOT IN (v_room.customer_id, v_room.artist_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed to message in this room';
  END IF;

  SELECT COALESCE(array_agg(value::TEXT), '{}')
  INTO v_attachments
  FROM jsonb_array_elements_text(p_attachments);

  INSERT INTO public.messages (chat_room_id, sender_id, message_type, content, attachments)
  VALUES (p_chat_room_id, auth.uid(), p_message_type::public.message_type, p_content, v_attachments)
  RETURNING * INTO v_message;

  RETURN v_message;
END;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are readable for marketplace"
ON public.profiles FOR SELECT
USING (TRUE);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Public artworks are readable"
ON public.artist_artworks FOR SELECT
USING (is_public = TRUE OR auth.uid() = artist_id OR public.is_admin());

CREATE POLICY "Artists manage own artworks"
ON public.artist_artworks FOR ALL
USING (auth.uid() = artist_id OR public.is_admin())
WITH CHECK (auth.uid() = artist_id OR public.is_admin());

CREATE POLICY "Request participants can read"
ON public.requests FOR SELECT
USING (
  auth.uid() = customer_id
  OR auth.uid() = assigned_artist_id
  OR auth.uid() = preferred_artist_id
  OR public.is_admin()
);

CREATE POLICY "Customers create requests"
ON public.requests FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Request participants can update"
ON public.requests FOR UPDATE
USING (
  auth.uid() = customer_id
  OR auth.uid() = assigned_artist_id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = assigned_artist_id
  OR public.is_admin()
);

CREATE POLICY "Chat participants can read rooms"
ON public.chat_rooms FOR SELECT
USING (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR (admin_can_view = TRUE AND public.is_admin())
);

CREATE POLICY "Participants and admins create rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
);

CREATE POLICY "Participants and admins update rooms"
ON public.chat_rooms FOR UPDATE
USING (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
);

CREATE POLICY "Chat participants can read messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.chat_rooms cr
    WHERE cr.id = chat_room_id
      AND (
        auth.uid() = cr.customer_id
        OR auth.uid() = cr.artist_id
        OR (cr.admin_can_view = TRUE AND public.is_admin())
      )
  )
);

CREATE POLICY "Chat participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_rooms cr
    WHERE cr.id = chat_room_id
      AND (auth.uid() = cr.customer_id OR auth.uid() = cr.artist_id OR public.is_admin())
  )
);

CREATE POLICY "Chat participants can update message read state"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.chat_rooms cr
    WHERE cr.id = chat_room_id
      AND (auth.uid() = cr.customer_id OR auth.uid() = cr.artist_id OR public.is_admin())
  )
);

CREATE POLICY "Order participants can read"
ON public.orders FOR SELECT
USING (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
);

CREATE POLICY "Customers and admins create orders"
ON public.orders FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  OR public.is_admin()
);

CREATE POLICY "Order participants can update"
ON public.orders FOR UPDATE
USING (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = artist_id
  OR public.is_admin()
);

CREATE POLICY "Reviews are public"
ON public.reviews FOR SELECT
USING (TRUE);

CREATE POLICY "Customers review own orders"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_id
      AND o.customer_id = auth.uid()
      AND o.artist_id = artist_id
      AND o.status IN ('delivered', 'completed')
  )
);

CREATE POLICY "Customers update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = customer_id OR auth.uid() = artist_id OR public.is_admin())
WITH CHECK (auth.uid() = customer_id OR auth.uid() = artist_id OR public.is_admin());

CREATE POLICY "Users manage own wishlist"
ON public.wishlist_items FOR ALL
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Reporters and admins read reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Authenticated users create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id);

CREATE POLICY "Admins update reports"
ON public.reports FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Order participants read payment events"
ON public.payment_events FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_id
      AND (auth.uid() = o.customer_id OR auth.uid() = o.artist_id)
  )
);

CREATE POLICY "Admins insert payment events"
ON public.payment_events FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Users read own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins read activity log"
ON public.activity_log FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins write activity log"
ON public.activity_log FOR INSERT
WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets and policies
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('artist-artworks', 'artist-artworks', TRUE),
  ('reference-images', 'reference-images', FALSE),
  ('order-artwork', 'order-artwork', FALSE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public can view artist artworks" ON storage.objects;
DROP POLICY IF EXISTS "Artists upload own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Artists update own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Artists delete own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users read own reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own order artwork" ON storage.objects;
DROP POLICY IF EXISTS "Users read own order artwork" ON storage.objects;

CREATE POLICY "Public can view artist artworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-artworks');

CREATE POLICY "Artists upload own artworks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artist-artworks'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Artists update own artworks"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artist-artworks'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Artists delete own artworks"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artist-artworks'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Users manage own reference images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reference-images'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own reference images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reference-images'
  AND (auth.uid()::TEXT = (storage.foldername(name))[1] OR public.is_admin())
);

CREATE POLICY "Users manage own order artwork"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-artwork'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own order artwork"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-artwork'
  AND (auth.uid()::TEXT = (storage.foldername(name))[1] OR public.is_admin())
);

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'requests',
    'chat_rooms',
    'messages',
    'orders',
    'reports',
    'payment_events',
    'notifications'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE FORMAT('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;

-- Recreate profiles for existing auth users after the reset.
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  CASE
    WHEN u.raw_user_meta_data->>'role' IN ('customer', 'artist', 'admin')
      THEN (u.raw_user_meta_data->>'role')::public.user_role
    ELSE 'customer'::public.user_role
  END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

COMMIT;
