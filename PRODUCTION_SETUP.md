# Giftra Production Setup

Giftra is a controlled transaction and collaboration system. The production app must enforce workflow rules in Supabase, not only in the UI.

## Supabase

1. Create a Supabase project.
2. Enable Email/Password auth and Google OAuth in Authentication providers.
3. Run `supabase/schema.sql` in the SQL editor for the base schema.
4. Run `supabase/production-workflow.sql` for the production workflow tables, RPCs, RLS policies, payments, disputes, storage buckets, and locked chat rules.
5. Enable Realtime for:
   - `giftra_chat_rooms`
   - `giftra_messages`
   - `giftra_orders`
   - `gift_requests`
6. Verify private storage buckets exist:
   - `reference-images`
   - `order-artwork`
7. Create at least one admin user by signing up, then running:

```sql
update public.profiles
set role = 'admin', is_super_admin = true
where email = 'admin@example.com';
```

## Vercel

Set these environment variables:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-domain.com/auth/callback
```

Optional local-only demo mode:

```txt
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

Do not enable demo auth or mock payments in production.

## Payments

The UI can create unpaid orders, and local development can use `NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true` to mark an order as paid. Production still needs a real payment provider such as Stripe or Lemon Squeezy.

Required production work:

1. Create checkout sessions from a server route or server action.
2. Confirm payment in a provider webhook.
3. Only after webhook confirmation, call the Supabase payment workflow/RPC or update the order with a real provider payment id.
4. Keep `NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS` unset in production.

## Storage

Reference images and chat/order artwork use Supabase Storage.

Required buckets:

- `reference-images`
- `order-artwork`

The production workflow SQL creates private buckets. If you keep them private, generate signed URLs when displaying files. The current app stores signed URLs for uploaded files so uploads work immediately for the active workflow; for long-lived private assets, add a refresh/signing endpoint.

## Workflow Guarantees

Production mutations should call RPC-backed workflow functions:

- `assign_artist_and_price`
- `record_payment_and_unlock_chat`
- `transition_order`
- `send_chat_message`

The frontend helper layer is in `lib/supabase/workflow.ts`.

## Payment Provider

`record_payment_and_unlock_chat` expects a provider payment id and amount. Wire Stripe, Lemon Squeezy, or another payment provider webhook to call this only after the provider confirms payment succeeded.

Never unlock chat or transition an order from the client without a confirmed payment event.
