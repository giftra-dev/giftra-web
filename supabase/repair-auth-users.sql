-- Repair Supabase Auth rows that were created by older/manual seed scripts.
--
-- Symptom:
--   /auth/v1/token?grant_type=password returns 500
--   Auth log says:
--   error finding user: sql: Scan error on column ... "confirmation_token":
--   converting NULL to string is unsupported
--
-- Run this in Supabase SQL Editor. It only normalizes nullable auth token fields
-- that GoTrue expects to scan as strings.
--
-- Important: do not normalize auth.users.phone to an empty string. Supabase has
-- a unique phone constraint, so multiple blank phone values would violate it.

DO $$
DECLARE
  col_name TEXT;
  text_columns TEXT[] := ARRAY[
    'confirmation_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token',
    'reauthentication_token',
    'email_change'
  ];
BEGIN
  FOREACH col_name IN ARRAY text_columns LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = col_name
    ) THEN
      EXECUTE format('UPDATE auth.users SET %I = COALESCE(%I, '''') WHERE %I IS NULL', col_name, col_name, col_name);
    END IF;
  END LOOP;
END $$;

-- Make sure seeded/demo users also have matching identities.
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.id,
  u.id::TEXT,
  'email',
  jsonb_build_object('sub', u.id::TEXT, 'email', u.email),
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN auth.identities i
  ON i.user_id = u.id
 AND i.provider = 'email'
WHERE i.id IS NULL
  AND u.email IS NOT NULL
ON CONFLICT (provider, provider_id) DO NOTHING;
