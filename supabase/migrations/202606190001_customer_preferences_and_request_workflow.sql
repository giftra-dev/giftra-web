-- Incremental migration for existing Giftra projects.
-- Keeps production databases off the destructive supabase/schema.sql reset path.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS customer_preferences JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS artist_decision TEXT NOT NULL DEFAULT 'pending' CHECK (artist_decision IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS artist_decision_note TEXT,
ADD COLUMN IF NOT EXISTS artist_decision_at TIMESTAMPTZ;

