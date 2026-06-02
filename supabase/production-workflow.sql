-- Giftra production workflow foundation.
-- Run after the base schema or on a fresh Supabase project before connecting production traffic.

create extension if not exists "uuid-ossp";

do $$ begin
  create type public.chat_workflow_state as enum (
    'admin_review',
    'artist_assigned',
    'artist_chat_active',
    'in_progress',
    'paused',
    'completed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.giftra_order_status as enum (
    'draft',
    'awaiting_payment',
    'in_progress',
    'preview_shared',
    'revision_requested',
    'ready_to_ship',
    'shipped',
    'delivered',
    'completed',
    'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.gift_request_status_v2 as enum (
    'admin_review',
    'approved',
    'artist_assigned',
    'awaiting_payment',
    'in_progress',
    'completed',
    'cancelled',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.gift_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_artist_id uuid references public.profiles(id) on delete set null,
  approved_by_admin_id uuid references public.profiles(id) on delete set null,
  category public.gift_category not null,
  description text not null,
  reference_images text[] not null default '{}',
  budget_min numeric(10,2) not null check (budget_min >= 0),
  budget_max numeric(10,2) not null check (budget_max >= budget_min),
  deadline date not null,
  final_price numeric(10,2) check (final_price >= 0),
  status public.gift_request_status_v2 not null default 'admin_review',
  admin_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  assigned_at timestamptz,
  constraint gift_requests_artist_is_artist check (
    assigned_artist_id is null or assigned_artist_id <> customer_id
  )
);

create table if not exists public.giftra_orders (
  id uuid primary key default uuid_generate_v4(),
  gift_request_id uuid not null unique references public.gift_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete restrict,
  order_number text not null unique default ('GFT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(uuid_generate_v4()::text, 1, 8))),
  status public.giftra_order_status not null default 'awaiting_payment',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  platform_fee numeric(10,2) not null default 0 check (platform_fee >= 0),
  total numeric(10,2) generated always as (subtotal + platform_fee) stored,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.giftra_chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  gift_request_id uuid not null unique references public.gift_requests(id) on delete cascade,
  order_id uuid unique references public.giftra_orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid references public.profiles(id) on delete restrict,
  state public.chat_workflow_state not null default 'admin_review',
  is_locked boolean not null default true,
  lock_reason text not null default 'Chat will unlock after next step is completed',
  admin_can_view boolean not null default true,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.giftra_messages (
  id uuid primary key default uuid_generate_v4(),
  chat_room_id uuid not null references public.giftra_chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message_type public.message_type not null default 'text',
  content text not null,
  attachments text[] not null default '{}',
  is_system boolean not null default false,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.giftra_orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'manual',
  provider_payment_id text,
  amount numeric(10,2) not null check (amount > 0),
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.giftra_orders(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'resolved', 'refunded', 'reassigned')),
  reason text not null,
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.gift_requests enable row level security;
alter table public.giftra_orders enable row level security;
alter table public.giftra_chat_rooms enable row level security;
alter table public.giftra_messages enable row level security;
alter table public.payments enable row level security;
alter table public.disputes enable row level security;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'admin'
$$;

drop policy if exists "gift_requests_select_participants" on public.gift_requests;
create policy "gift_requests_select_participants"
  on public.gift_requests for select
  using (customer_id = auth.uid() or assigned_artist_id = auth.uid() or public.is_admin());

drop policy if exists "gift_requests_insert_customer" on public.gift_requests;
create policy "gift_requests_insert_customer"
  on public.gift_requests for insert
  with check (customer_id = auth.uid() and public.current_role() = 'customer');

drop policy if exists "gift_requests_admin_update" on public.gift_requests;
create policy "gift_requests_admin_update"
  on public.gift_requests for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "giftra_orders_select_participants" on public.giftra_orders;
create policy "giftra_orders_select_participants"
  on public.giftra_orders for select
  using (customer_id = auth.uid() or artist_id = auth.uid() or public.is_admin());

drop policy if exists "giftra_chat_rooms_select_participants" on public.giftra_chat_rooms;
create policy "giftra_chat_rooms_select_participants"
  on public.giftra_chat_rooms for select
  using (customer_id = auth.uid() or artist_id = auth.uid() or public.is_admin());

drop policy if exists "giftra_messages_select_participants" on public.giftra_messages;
create policy "giftra_messages_select_participants"
  on public.giftra_messages for select
  using (
    exists (
      select 1 from public.giftra_chat_rooms rooms
      where rooms.id = chat_room_id
      and (rooms.customer_id = auth.uid() or rooms.artist_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "payments_select_customer_admin" on public.payments;
create policy "payments_select_customer_admin"
  on public.payments for select
  using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "disputes_select_participants" on public.disputes;
create policy "disputes_select_participants"
  on public.disputes for select
  using (
    opened_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.giftra_orders orders
      where orders.id = order_id
      and (orders.customer_id = auth.uid() or orders.artist_id = auth.uid())
    )
  );

create or replace function public.add_system_message(p_chat_room_id uuid, p_content text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  insert into public.giftra_messages (chat_room_id, sender_id, message_type, content, is_system, is_read)
  values (p_chat_room_id, null, 'system', p_content, true, false)
  returning id into v_message_id;

  update public.giftra_chat_rooms
  set last_message_at = now()
  where id = p_chat_room_id;

  return v_message_id;
end;
$$;

create or replace function public.assign_artist_and_price(
  p_gift_request_id uuid,
  p_artist_id uuid,
  p_final_price numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.gift_requests;
  v_order_id uuid;
  v_chat_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign artists';
  end if;

  select * into v_request
  from public.gift_requests
  where id = p_gift_request_id
  for update;

  if not found then
    raise exception 'Gift request not found';
  end if;

  if v_request.status not in ('admin_review', 'approved') then
    raise exception 'Gift request cannot be assigned from status %', v_request.status;
  end if;

  if not exists (select 1 from public.profiles where id = p_artist_id and role = 'artist') then
    raise exception 'Assigned user must be an artist';
  end if;

  update public.gift_requests
  set assigned_artist_id = p_artist_id,
      approved_by_admin_id = auth.uid(),
      final_price = p_final_price,
      status = 'awaiting_payment',
      assigned_at = now(),
      updated_at = now()
  where id = p_gift_request_id;

  insert into public.giftra_orders (gift_request_id, customer_id, artist_id, status, subtotal, platform_fee)
  values (p_gift_request_id, v_request.customer_id, p_artist_id, 'awaiting_payment', p_final_price, round(p_final_price * 0.10, 2))
  returning id into v_order_id;

  insert into public.giftra_chat_rooms (
    gift_request_id,
    order_id,
    customer_id,
    artist_id,
    state,
    is_locked,
    lock_reason
  )
  values (
    p_gift_request_id,
    v_order_id,
    v_request.customer_id,
    p_artist_id,
    'artist_assigned',
    true,
    'Chat will unlock after payment is completed'
  )
  returning id into v_chat_id;

  perform public.add_system_message(v_chat_id, 'Artist assigned to your request');

  return v_chat_id;
end;
$$;

create or replace function public.record_payment_and_unlock_chat(
  p_order_id uuid,
  p_provider_payment_id text,
  p_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.giftra_orders;
  v_chat_id uuid;
begin
  select * into v_order
  from public.giftra_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.customer_id <> auth.uid() and not public.is_admin() then
    raise exception 'Only the customer or admin can record payment';
  end if;

  if v_order.status <> 'awaiting_payment' then
    raise exception 'Order is not awaiting payment';
  end if;

  if p_amount < v_order.total then
    raise exception 'Payment amount is below order total';
  end if;

  insert into public.payments (order_id, customer_id, provider_payment_id, amount, status)
  values (p_order_id, v_order.customer_id, p_provider_payment_id, p_amount, 'succeeded');

  update public.giftra_orders
  set status = 'in_progress',
      paid_at = now(),
      updated_at = now()
  where id = p_order_id;

  update public.gift_requests
  set status = 'in_progress',
      updated_at = now()
  where id = v_order.gift_request_id;

  update public.giftra_chat_rooms
  set state = 'in_progress',
      is_locked = false,
      lock_reason = null
  where order_id = p_order_id
  returning id into v_chat_id;

  perform public.add_system_message(v_chat_id, 'Payment received successfully');

  return v_chat_id;
end;
$$;

create or replace function public.transition_order(
  p_order_id uuid,
  p_from_status public.giftra_order_status,
  p_to_status public.giftra_order_status,
  p_note text default null
)
returns public.giftra_order_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.giftra_orders;
  v_role public.user_role;
  v_chat_id uuid;
begin
  select * into v_order from public.giftra_orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status <> p_from_status then raise exception 'Order status changed'; end if;

  v_role := public.current_role();

  if v_role = 'artist' and auth.uid() <> v_order.artist_id then
    raise exception 'Artist cannot update this order';
  end if;
  if v_role = 'customer' and auth.uid() <> v_order.customer_id then
    raise exception 'Customer cannot update this order';
  end if;

  if not (
    (p_from_status = 'in_progress' and p_to_status = 'preview_shared' and v_role = 'artist') or
    (p_from_status = 'preview_shared' and p_to_status = 'revision_requested' and v_role = 'customer') or
    (p_from_status = 'preview_shared' and p_to_status = 'ready_to_ship' and v_role = 'customer') or
    (p_from_status = 'revision_requested' and p_to_status = 'preview_shared' and v_role = 'artist') or
    (p_from_status = 'ready_to_ship' and p_to_status = 'shipped' and v_role in ('artist', 'admin')) or
    (p_from_status = 'shipped' and p_to_status = 'delivered' and v_role in ('customer', 'admin')) or
    (p_from_status = 'delivered' and p_to_status = 'completed' and v_role in ('customer', 'admin')) or
    (p_to_status = 'refunded' and v_role = 'admin')
  ) then
    raise exception 'Invalid or unauthorized order transition % -> %', p_from_status, p_to_status;
  end if;

  update public.giftra_orders set status = p_to_status, updated_at = now() where id = p_order_id;

  update public.giftra_chat_rooms
  set state = case
    when p_to_status = 'completed' then 'completed'::public.chat_workflow_state
    when p_to_status in ('in_progress', 'preview_shared', 'revision_requested', 'ready_to_ship') then 'in_progress'::public.chat_workflow_state
    else state
  end
  where order_id = p_order_id
  returning id into v_chat_id;

  perform public.add_system_message(
    v_chat_id,
    case
      when p_to_status = 'preview_shared' then 'Awaiting customer approval'
      when p_to_status = 'revision_requested' then 'Revision requested'
      when p_to_status = 'completed' then 'Order marked as completed'
      else coalesce(p_note, 'Order status updated')
    end
  );

  return p_to_status;
end;
$$;

create or replace function public.send_chat_message(
  p_chat_room_id uuid,
  p_message_type public.message_type,
  p_content text,
  p_attachments text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.giftra_chat_rooms;
  v_message_id uuid;
begin
  select * into v_room from public.giftra_chat_rooms where id = p_chat_room_id for update;
  if not found then raise exception 'Chat room not found'; end if;
  if v_room.is_locked then raise exception 'Chat is locked'; end if;
  if auth.uid() not in (v_room.customer_id, v_room.artist_id) then raise exception 'Not a chat participant'; end if;
  if public.current_role() = 'admin' then raise exception 'Admin chat access is read-only'; end if;
  if p_message_type = 'system' then raise exception 'System messages can only be generated by workflow actions'; end if;

  insert into public.giftra_messages (chat_room_id, sender_id, message_type, content, attachments)
  values (p_chat_room_id, auth.uid(), p_message_type, p_content, p_attachments)
  returning id into v_message_id;

  update public.giftra_chat_rooms set last_message_at = now() where id = p_chat_room_id;

  return v_message_id;
end;
$$;

insert into storage.buckets (id, name, public)
values
  ('reference-images', 'reference-images', false),
  ('order-artwork', 'order-artwork', false),
  ('artist-artworks', 'artist-artworks', true)
on conflict (id) do nothing;

drop policy if exists "authenticated_upload_reference_images" on storage.objects;
create policy "authenticated_upload_reference_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'reference-images');

drop policy if exists "authenticated_upload_order_artwork" on storage.objects;
create policy "authenticated_upload_order_artwork"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'order-artwork');

drop policy if exists "artists_upload_artist_artworks" on storage.objects;
create policy "artists_upload_artist_artworks"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artist-artworks');

drop policy if exists "authenticated_read_uploaded_assets" on storage.objects;
create policy "authenticated_read_uploaded_assets"
  on storage.objects for select
  to authenticated
  using (bucket_id in ('reference-images', 'order-artwork', 'artist-artworks'));
