# Giftra Production Setup

This project now uses `supabase/schema.sql` as the complete source of truth for the database. It recreates the app tables, storage buckets, RLS policies, realtime publication, auth profile trigger, and production workflow RPCs.

## 1. Back Up Before Resetting

`supabase/schema.sql` is destructive.

Before running it in a live Supabase project:

1. Open Supabase Dashboard.
2. Go to **Project Settings > Database > Backups**.
3. Download a fresh backup or make sure point-in-time recovery is available.
4. Export any data you need from `profiles`, `requests`, `orders`, `messages`, `reviews`, and `artist_artworks`.

The reset deletes Giftra tables in the `public` schema. It does not delete `auth.users`, but it recreates `profiles` from existing auth users.

## 2. Run The Fresh Schema

1. Open **Supabase Dashboard > SQL Editor**.
2. Paste the full contents of `supabase/schema.sql`.
3. Run it once.
4. Confirm these tables exist:
   - `profiles`
   - `artist_artworks`
   - `requests`
   - `chat_rooms`
   - `messages`
   - `orders`
   - `reviews`
   - `notifications`
   - `activity_log`

The schema also creates:

- `artist-artworks`, `reference-images`, and `order-artwork` storage buckets.
- RLS policies for customer, artist, and admin flows.
- Realtime for `requests`, `chat_rooms`, `messages`, `orders`, and `notifications`.
- RPCs for assignment, payment unlock, order status transitions, and chat messages.

Do not run the old `production-workflow.sql` unless you intentionally want to maintain a separate legacy workflow. The regenerated `schema.sql` includes the current workflow support.

## 3. Seed Demo Marketplace Data

Optional, but useful for testing the marketplace homepage.

1. Open **Supabase Dashboard > SQL Editor**.
2. Paste the full contents of `supabase/sample-marketplace.sql`.
3. Run it after `schema.sql`.

It creates:

- Admin user: `admin@giftra.co.in`
- 20 sample artists
- 12 sample customers
- 150 sample artworks across all gift categories
- 90 completed orders and reviews

Demo password for seeded users:

```text
Password123!
```

Remove or replace this seed data before real launch.

## 4. Admin Login

If you ran the sample seed, use:

```text
Email: admin@giftra.co.in
Password: Password123!
```

For a real production admin:

1. Create the user in **Supabase Auth > Users** or through the app signup.
2. Run this SQL with the real email:

```sql
UPDATE public.profiles
SET role = 'admin', is_super_admin = TRUE
WHERE email = 'your-admin-email@example.com';
```

## 5. Environment Variables

Set these in Vercel and in your local `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qwfzubwqitaqcvvuojyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://www.giftra.co.in
NEXT_PUBLIC_APP_URL=https://www.giftra.co.in
```

If you use server-only actions later, also add:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose the service role key in client code.

## 6. Supabase Auth URLs

In **Supabase Dashboard > Authentication > URL Configuration**:

Set **Site URL**:

```text
https://www.giftra.co.in
```

Add **Redirect URLs**:

```text
https://www.giftra.co.in/auth/callback
https://giftra.co.in/auth/callback
http://localhost:3000/auth/callback
```

Avoid setting the Site URL to a Vercel preview domain, a bare hostname without `https://`, or the Supabase project URL.

## 7. Google Sign-In

In **Google Cloud Console > APIs & Services > Credentials**:

Authorized JavaScript origins:

```text
https://www.giftra.co.in
https://giftra.co.in
http://localhost:3000
```

Authorized redirect URIs:

```text
https://qwfzubwqitaqcvvuojyo.supabase.co/auth/v1/callback
```

In **Supabase Dashboard > Authentication > Providers > Google**:

1. Enable Google.
2. Paste the Google Client ID.
3. Paste the Google Client Secret.
4. Save.

Google will still show the Supabase callback domain during the OAuth handoff because Supabase Auth is the OAuth broker. After the callback completes, users should land back on `https://www.giftra.co.in/auth/callback`, then the app redirects them by role.

## 8. Vercel Domain Setup

In **Vercel > Project > Settings > Domains**:

1. Add `giftra.co.in`.
2. Add `www.giftra.co.in`.
3. Make `www.giftra.co.in` the primary production domain.
4. Configure DNS at your domain provider using Vercel's instructions.

Then redeploy after setting env vars.

## 9. Realtime Verification

The schema attempts to add these tables to `supabase_realtime`:

- `requests`
- `chat_rooms`
- `messages`
- `orders`
- `notifications`

Verify in **Supabase Dashboard > Database > Replication** that realtime is enabled for those tables.

If messages or notifications do not update live, also confirm RLS policies allow the current user to read the row.

## 10. Storage Verification

The schema creates these buckets:

- `artist-artworks`: public read, artist-owned uploads.
- `reference-images`: private customer request references.
- `order-artwork`: private order delivery assets.

Recommended upload paths:

```text
artist-artworks/{artist_user_id}/filename.jpg
reference-images/{customer_user_id}/filename.jpg
order-artwork/{artist_or_customer_user_id}/filename.jpg
```

The storage policies depend on the first folder segment matching the authenticated user id.

## 11. Payments

The database includes payment-ready fields and an RPC named `record_payment_and_unlock_chat`, but you still need a payment provider integration.

Production checklist:

- Create Razorpay or Stripe account.
- Add provider keys to Vercel as server-only env vars.
- Create payment intent/order from a server route.
- Verify payment with webhook signature.
- Call `record_payment_and_unlock_chat` only after webhook verification.
- Keep chat locked until payment is confirmed.

## 12. Email And Notifications

Supabase Auth handles auth emails. For marketplace emails, add a transactional provider such as Resend, Postmark, SendGrid, or Amazon SES.

Recommended emails:

- Request submitted.
- Request approved or rejected.
- Artist assigned.
- Payment received.
- New chat message.
- Order shipped.
- Order delivered.
- Review request.

## 13. Production Hardening

Before launch:

- Replace sample data.
- Use real uploaded artwork images instead of remote seed URLs.
- Add legal pages for privacy, terms, refunds, and contact.
- Add rate limiting to request creation and chat message APIs.
- Move sensitive workflow writes to server routes or edge functions.
- Add Sentry or equivalent error monitoring.
- Add analytics for marketplace search, request creation, and checkout.
- Test customer, artist, and admin flows on desktop and mobile.

## 14. Local Commands

Install dependencies:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Build locally:

```bash
pnpm build
```

Use Node `20.9.0` or newer for the current Next.js version.
