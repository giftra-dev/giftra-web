-- Giftra sample marketplace data
-- Run after supabase/schema.sql.
-- Creates demo auth users, 20 artists, 12 customers, 150 artworks, and reviews.
-- Demo password for seeded users: Password123!

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE FROM auth.identities
WHERE provider = 'email'
  AND (
    provider_id = 'admin@giftra.co.in'
    OR provider_id LIKE 'artist%@giftra.test'
    OR provider_id LIKE 'customer%@giftra.test'
    OR identity_data->>'email' = 'admin@giftra.co.in'
    OR identity_data->>'email' LIKE 'artist%@giftra.test'
    OR identity_data->>'email' LIKE 'customer%@giftra.test'
  );

DELETE FROM auth.users
WHERE id = '00000000-0000-0000-0000-000000000001'
  OR email = 'admin@giftra.co.in'
  OR email LIKE 'artist%@giftra.test'
  OR email LIKE 'customer%@giftra.test';

DO $$
DECLARE
  categories public.gift_category[] := ARRAY[
    'portrait'::public.gift_category,
    'caricature'::public.gift_category,
    'illustration'::public.gift_category,
    'calligraphy'::public.gift_category,
    'custom_jewelry'::public.gift_category,
    'woodwork'::public.gift_category,
    'pottery'::public.gift_category,
    'textile'::public.gift_category,
    'digital_art'::public.gift_category,
    'other'::public.gift_category
  ];
  artist_names TEXT[] := ARRAY[
    'Aarav Studio', 'Meera Handmade', 'Riya Portrait Co', 'Kabir Keepsakes',
    'Anika Art House', 'Dev Woodcraft', 'Tara Threads', 'Isha Inkworks',
    'Nikhil Clay Lab', 'Zoya Custom Gifts', 'Rohan Digital Atelier',
    'Priya Paper Studio', 'Arjun Miniatures', 'Naina Jewelry Works',
    'Vihaan Caricatures', 'Sara Memory Frames', 'Kian Calligraphy',
    'Maya Giftworks', 'Reyansh Folk Art', 'Avni Color Room'
  ];
  city_names TEXT[] := ARRAY[
    'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
    'Pune', 'Kolkata', 'Jaipur', 'Kochi', 'Ahmedabad'
  ];
  sample_images TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80'
  ];
  title_prefix TEXT[] := ARRAY[
    'Personalized', 'Handmade', 'Custom', 'Signature', 'Premium',
    'Anniversary', 'Birthday', 'Memory', 'Miniature', 'Festive'
  ];
  title_subject TEXT[] := ARRAY[
    'Couple Portrait', 'Family Illustration', 'Pet Caricature', 'Name Plate',
    'Keepsake Box', 'Clay Mug', 'Embroidered Hoop', 'Digital Poster',
    'Silver Charm', 'Quote Frame', 'Wedding Gift', 'Baby Memory Art'
  ];
  i INTEGER;
  rating_value INTEGER;
  artist_id UUID;
  customer_id UUID;
  request_id UUID;
  order_id UUID;
  artwork_id UUID;
  chosen_category public.gift_category;
  min_price NUMERIC(10,2);
  max_price NUMERIC(10,2);
BEGIN
  -- Admin
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@giftra.co.in',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::JSONB,
    '{"role":"admin","full_name":"Giftra Admin"}'::JSONB,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

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
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'email',
    jsonb_build_object(
      'sub', '00000000-0000-0000-0000-000000000001',
      'email', 'admin@giftra.co.in',
      'email_verified', true,
      'phone_verified', false
    ),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider_id, provider) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();

  INSERT INTO public.profiles (id, email, full_name, role, is_super_admin)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@giftra.co.in',
    'Giftra Admin',
    'admin',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin', is_super_admin = TRUE;

  -- Artists
  FOR i IN 1..20 LOOP
    artist_id := ('10000000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      artist_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'artist' || i || '@giftra.test',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::JSONB,
      jsonb_build_object('role', 'artist', 'full_name', artist_names[i]),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

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
    VALUES (
      artist_id,
      artist_id,
      artist_id::TEXT,
      'email',
      jsonb_build_object(
        'sub', artist_id::TEXT,
        'email', 'artist' || i || '@giftra.test',
        'email_verified', true,
        'phone_verified', false
      ),
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      identity_data = EXCLUDED.identity_data,
      updated_at = NOW();

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      avatar_url,
      role,
      bio,
      portfolio_url,
      specialties,
      is_available
    )
    VALUES (
      artist_id,
      'artist' || i || '@giftra.test',
      artist_names[i],
      sample_images[((i - 1) % ARRAY_LENGTH(sample_images, 1)) + 1],
      'artist',
      artist_names[i] || ' creates custom gifts from ' || city_names[((i - 1) % ARRAY_LENGTH(city_names, 1)) + 1] || ', with a focus on warm, personal details and gift-ready finishing.',
      'https://www.giftra.co.in/artists/sample-' || i,
      ARRAY[
        categories[((i - 1) % ARRAY_LENGTH(categories, 1)) + 1],
        categories[(i % ARRAY_LENGTH(categories, 1)) + 1],
        categories[((i + 2) % ARRAY_LENGTH(categories, 1)) + 1]
      ],
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      bio = EXCLUDED.bio,
      specialties = EXCLUDED.specialties,
      is_available = TRUE;
  END LOOP;

  -- Customers
  FOR i IN 1..12 LOOP
    customer_id := ('20000000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      customer_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'customer' || i || '@giftra.test',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::JSONB,
      jsonb_build_object('role', 'customer', 'full_name', 'Sample Customer ' || i),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

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
    VALUES (
      customer_id,
      customer_id,
      customer_id::TEXT,
      'email',
      jsonb_build_object(
        'sub', customer_id::TEXT,
        'email', 'customer' || i || '@giftra.test',
        'email_verified', true,
        'phone_verified', false
      ),
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      identity_data = EXCLUDED.identity_data,
      updated_at = NOW();

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      customer_id,
      'customer' || i || '@giftra.test',
      'Sample Customer ' || i,
      'customer'
    )
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  END LOOP;

  -- Artwork listings
  FOR i IN 1..150 LOOP
    artist_id := ('10000000-0000-0000-0000-' || LPAD((((i - 1) % 20) + 1)::TEXT, 12, '0'))::UUID;
    chosen_category := categories[((i - 1) % ARRAY_LENGTH(categories, 1)) + 1];
    min_price := 499 + (((i - 1) % 18) * 150);
    max_price := min_price + 700 + (((i - 1) % 5) * 350);

    INSERT INTO public.artist_artworks (
      artist_id,
      title,
      description,
      category,
      image_url,
      price_min,
      price_max,
      tags,
      is_featured,
      is_public,
      created_at
    )
    VALUES (
      artist_id,
      title_prefix[((i - 1) % ARRAY_LENGTH(title_prefix, 1)) + 1] || ' ' || title_subject[((i - 1) % ARRAY_LENGTH(title_subject, 1)) + 1],
      'A custom-made ' || REPLACE(chosen_category::TEXT, '_', ' ') || ' gift with artist consultation, preview sharing, and personalized finishing.',
      chosen_category,
      sample_images[((i - 1) % ARRAY_LENGTH(sample_images, 1)) + 1],
      min_price,
      max_price,
      ARRAY[
        chosen_category::TEXT,
        'custom gift',
        'personalized',
        city_names[((i - 1) % ARRAY_LENGTH(city_names, 1)) + 1]
      ],
      i <= 24,
      TRUE,
      NOW() - ((i % 45) || ' days')::INTERVAL
    )
    RETURNING id INTO artwork_id;
  END LOOP;

  -- Completed sample orders and reviews to populate artist ratings.
  FOR i IN 1..90 LOOP
    customer_id := ('20000000-0000-0000-0000-' || LPAD((((i - 1) % 12) + 1)::TEXT, 12, '0'))::UUID;
    artist_id := ('10000000-0000-0000-0000-' || LPAD((((i - 1) % 20) + 1)::TEXT, 12, '0'))::UUID;
    chosen_category := categories[((i - 1) % ARRAY_LENGTH(categories, 1)) + 1];
    request_id := uuid_generate_v4();
    order_id := uuid_generate_v4();
    rating_value := CASE
      WHEN i % 17 = 0 THEN 3
      WHEN i % 5 = 0 THEN 4
      ELSE 5
    END;

    INSERT INTO public.requests (
      id,
      customer_id,
      assigned_artist_id,
      approved_by_admin_id,
      title,
      description,
      category,
      occasion,
      budget_min,
      budget_max,
      final_price,
      status,
      approved_at,
      assigned_at,
      completed_at,
      created_at
    )
    VALUES (
      request_id,
      customer_id,
      artist_id,
      '00000000-0000-0000-0000-000000000001',
      'Sample completed gift request ' || i,
      'Seeded completed order used for marketplace ratings and review previews.',
      chosen_category,
      CASE WHEN i % 2 = 0 THEN 'Birthday' ELSE 'Anniversary' END,
      800,
      5500,
      1299 + (i * 35),
      'delivered',
      NOW() - ((i + 10) || ' days')::INTERVAL,
      NOW() - ((i + 9) || ' days')::INTERVAL,
      NOW() - ((i % 30) || ' days')::INTERVAL,
      NOW() - ((i + 15) || ' days')::INTERVAL
    );

    INSERT INTO public.orders (
      id,
      request_id,
      customer_id,
      artist_id,
      status,
      subtotal,
      platform_fee,
      total,
      paid_at,
      delivered_at,
      created_at
    )
    VALUES (
      order_id,
      request_id,
      customer_id,
      artist_id,
      'completed',
      1299 + (i * 35),
      ROUND(((1299 + (i * 35)) * 0.10)::NUMERIC, 2),
      ROUND(((1299 + (i * 35)) * 1.10)::NUMERIC, 2),
      NOW() - ((i + 12) || ' days')::INTERVAL,
      NOW() - ((i % 30) || ' days')::INTERVAL,
      NOW() - ((i + 14) || ' days')::INTERVAL
    );

    INSERT INTO public.reviews (
      order_id,
      customer_id,
      artist_id,
      rating,
      title,
      content,
      created_at
    )
    VALUES (
      order_id,
      customer_id,
      artist_id,
      rating_value,
      CASE
        WHEN rating_value = 5 THEN 'Beautifully personal'
        WHEN rating_value = 4 THEN 'Lovely gift experience'
        ELSE 'Good work with small delays'
      END,
      'The artist understood the brief and created a thoughtful custom gift. The final piece felt personal and gift-ready.',
      NOW() - ((i % 25) || ' days')::INTERVAL
    );
  END LOOP;
END;
$$;

COMMIT;
