export const hasSupabaseConfig =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isDemoAuthAllowed =
  process.env.NODE_ENV !== "production" && !hasSupabaseConfig
