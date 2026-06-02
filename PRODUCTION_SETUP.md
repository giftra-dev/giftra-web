# Giftra Production Setup

Giftra is a controlled transaction and collaboration system. The production app must enforce workflow rules in Supabase, not only in the UI.

## Supabase

1. Create a Supabase project.
2. Enable Email/Password auth and Google OAuth in Authentication providers.
3. Run `supabase/schema.sql` in the SQL editor for the base schema.
4. Run `supabase/production-workflow.sql` for the production workflow tables, RPCs, RLS policies, payments, disputes, storage buckets, and locked chat rules.
5. Optional demo catalog: run `supabase/sample-marketplace.sql` to create 15 sample artists, 120 public artwork listings, and sample reviews for the homepage marketplace.
6. Enable Realtime for:
   - `giftra_chat_rooms`
   - `giftra_messages`
   - `giftra_orders`
   - `gift_requests`
7. Verify private storage buckets exist:
   - `reference-images`
   - `order-artwork`
8. Create at least one admin user by signing up, then running:

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
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://www.giftra.co.in/auth/callback
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

Recommended India-ready options:

- Razorpay: useful for domestic payment methods and UPI.
- Stripe: useful if your account/country setup supports the needed payment methods.

Add provider secrets only as server-side Vercel environment variables. Never expose secret keys as `NEXT_PUBLIC_*`.

## Storage

Reference images and chat/order artwork use Supabase Storage.

Required buckets:

- `reference-images`
- `order-artwork`
- `artist-artworks` (public, so anonymous visitors can browse portfolio photos)

The production workflow SQL creates private buckets for request/order files and a public bucket for artist portfolio samples. If you make `artist-artworks` private instead, add a signing endpoint because anonymous visitors need to see marketplace images.

## Marketplace / Artist Portfolios

The public browse experience uses `artist_artworks` plus artist profile fields. If you already created the database before this feature existed, run the latest `supabase/schema.sql` changes manually or apply equivalent migrations:

- Add `preferred_artist_id` and `inspiration_artwork_id` to `requests`.
- Create `artist_artworks`.
- Add RLS policies that allow public reads for `is_public = true` and artist-only create/update/delete.
- Create the public `artist-artworks` storage bucket.

Artists add sample work from `/artist/settings`. Customers and anonymous visitors browse at `/browse`, favorite work locally in the browser, and start a request from a selected artwork.

For local/demo catalogs, run `supabase/sample-marketplace.sql` after the schema files. The sample portfolio photos are external placeholder images; replace them with real uploads in `artist-artworks` before production use.

The marketplace also includes:

- `/artwork/[id]` for public artwork detail pages.
- `/category/[category]` for category landing pages.
- `/wishlist` for browser-local saved artwork.
- `/sitemap.xml` and `/robots.txt` for basic SEO discovery.

Before launch, replace starter `/privacy` and `/terms` copy with counsel-approved legal text and add a real support email/contact route.

## Email And Notifications

Supabase Auth handles login and signup email. Production order notifications still need a transactional email provider.

Recommended setup:

1. Add Resend, SendGrid, Postmark, or another transactional provider.
2. Send email on request submitted, request approved/rejected, artist assigned, payment received, preview shared, revision requested, shipped, delivered, and completed.
3. Keep in-app notifications in the `notifications` table for dashboard visibility.
4. Enable Realtime on `notifications`, `chat_rooms`, `messages`, `requests`, and `orders` if you want live updates.

## Monitoring And Analytics

Vercel Analytics is included. For production reliability, also add:

- Error monitoring such as Sentry.
- Payment webhook logs.
- Admin audit log review.
- Uptime monitoring for `https://www.giftra.co.in`.
- Conversion events for search, wishlist, request creation, payment, and completed order.

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
