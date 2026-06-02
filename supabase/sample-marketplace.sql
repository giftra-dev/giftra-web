-- =====================================================
-- GIFTRA SAMPLE MARKETPLACE DATA
-- Creates anonymous sample artists, portfolio artwork, and reviews.
-- Run after supabase/schema.sql.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  categories gift_category[] := ARRAY[
    'portrait'::gift_category,
    'caricature'::gift_category,
    'illustration'::gift_category,
    'calligraphy'::gift_category,
    'custom_jewelry'::gift_category,
    'woodwork'::gift_category,
    'pottery'::gift_category,
    'textile'::gift_category,
    'digital_art'::gift_category,
    'other'::gift_category
  ];
  artist_bios text[] := ARRAY[
    'Soft, expressive handmade work with a focus on meaningful keepsakes.',
    'Detailed custom pieces for milestone gifts, family stories, and celebrations.',
    'Color-rich portfolio with playful forms and polished finishing.',
    'Minimal, elegant custom work designed for premium gifting moments.',
    'Warm handcrafted style with careful attention to texture and personality.',
    'Modern custom gifts with clean presentation and thoughtful symbolism.',
    'Whimsical work for birthdays, weddings, pets, and family memories.',
    'Traditional craft technique blended with contemporary gift design.',
    'Highly personalized pieces made from stories, photos, and small details.',
    'Bold decorative gifts with strong shapes, pattern, and color.',
    'Delicate commissioned work for intimate, sentimental occasions.',
    'Gallery-style custom pieces adapted for home display and gifting.',
    'Playful character-driven gifts with expressive details.',
    'Refined heirloom-style work for anniversaries and special milestones.',
    'Experimental custom artwork with unusual materials and finishes.'
  ];
  adjectives text[] := ARRAY[
    'Heirloom', 'Dreamlike', 'Botanical', 'Luminous', 'Whimsical', 'Modern',
    'Keepsake', 'Celestial', 'Storybook', 'Minimal', 'Vintage', 'Joyful'
  ];
  subjects text[] := ARRAY[
    'Family Memory', 'Wedding Moment', 'Pet Tribute', 'Birthday Surprise',
    'Anniversary Gift', 'Home Portrait', 'Travel Memory', 'New Baby Gift',
    'Friendship Token', 'Holiday Keepsake', 'Graduation Gift', 'Love Note'
  ];
  review_titles text[] := ARRAY[
    'Beautifully made', 'Exactly the right gift', 'So personal', 'Wonderful detail',
    'Loved the final piece', 'Thoughtful and polished', 'Great experience',
    'Exceeded expectations'
  ];
  artist_id uuid;
  customer_id uuid;
  request_id uuid;
  order_id uuid;
  artwork_id uuid;
  category gift_category;
  i int;
BEGIN
  -- Sample customers for reviews.
  FOR i IN 1..10 LOOP
    customer_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-customer-' || i);

    INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      customer_id,
      'authenticated',
      'authenticated',
      'sample.customer.' || i || '@giftra.test',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sample Customer ' || i, 'role', 'customer'),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      customer_id,
      'sample.customer.' || i || '@giftra.test',
      'Sample Customer ' || i,
      'customer',
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at;
  END LOOP;

  -- Sample anonymous artists.
  FOR i IN 1..15 LOOP
    artist_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-artist-' || i);

    INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      artist_id,
      'authenticated',
      'authenticated',
      'sample.artist.' || i || '@giftra.test',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sample Artist ' || i, 'role', 'artist'),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      bio,
      avatar_url,
      specialties,
      rating,
      total_reviews,
      is_available,
      created_at,
      updated_at
    )
    VALUES (
      artist_id,
      'sample.artist.' || i || '@giftra.test',
      'Sample Artist ' || i,
      'artist',
      artist_bios[i],
      'https://i.pravatar.cc/240?img=' || (20 + i),
      ARRAY[
        categories[((i - 1) % array_length(categories, 1)) + 1],
        categories[((i + 2) % array_length(categories, 1)) + 1],
        categories[((i + 5) % array_length(categories, 1)) + 1]
      ]::gift_category[],
      4.2 + ((i % 8)::numeric / 10),
      12 + (i * 3),
      true,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      bio = excluded.bio,
      avatar_url = excluded.avatar_url,
      specialties = excluded.specialties,
      rating = excluded.rating,
      total_reviews = excluded.total_reviews,
      is_available = excluded.is_available,
      updated_at = now();
  END LOOP;

  -- 120 artwork samples across every category.
  FOR i IN 1..120 LOOP
    artist_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-artist-' || (((i - 1) % 15) + 1));
    artwork_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-artwork-' || i);
    category := categories[((i - 1) % array_length(categories, 1)) + 1];

    INSERT INTO artist_artworks (
      id,
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
      created_at,
      updated_at
    )
    VALUES (
      artwork_id,
      artist_id,
      adjectives[((i - 1) % array_length(adjectives, 1)) + 1] || ' ' ||
        subjects[((i - 1) % array_length(subjects, 1)) + 1],
      'Sample custom ' || replace(category::text, '_', ' ') ||
        ' concept for personalized gifting, shown as inspiration for a made-to-order request.',
      category,
      'https://picsum.photos/seed/giftra-artwork-' || i || '/900/900',
      45 + ((i * 7) % 180),
      95 + ((i * 11) % 340),
      ARRAY[
        replace(category::text, '_', ' '),
        lower(adjectives[((i - 1) % array_length(adjectives, 1)) + 1]),
        lower(replace(subjects[((i - 1) % array_length(subjects, 1)) + 1], ' ', '-'))
      ],
      i <= 18,
      true,
      now() - ((120 - i) || ' hours')::interval,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      image_url = excluded.image_url,
      price_min = excluded.price_min,
      price_max = excluded.price_max,
      tags = excluded.tags,
      is_featured = excluded.is_featured,
      is_public = excluded.is_public,
      updated_at = now();
  END LOOP;

  -- Sample completed orders and review comments so portfolio pages show feedback.
  FOR i IN 1..75 LOOP
    artist_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-artist-' || (((i - 1) % 15) + 1));
    customer_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-customer-' || (((i - 1) % 10) + 1));
    request_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-request-' || i);
    order_id := uuid_generate_v5(uuid_ns_url(), 'giftra-sample-order-' || i);
    category := categories[((i - 1) % array_length(categories, 1)) + 1];

    INSERT INTO requests (
      id,
      customer_id,
      assigned_artist_id,
      title,
      description,
      category,
      budget_min,
      budget_max,
      quoted_price,
      final_price,
      status,
      approved_at,
      assigned_at,
      completed_at,
      created_at,
      updated_at
    )
    VALUES (
      request_id,
      customer_id,
      artist_id,
      'Completed sample ' || replace(category::text, '_', ' ') || ' request',
      'Historical sample request used to display public feedback.',
      category,
      60,
      320,
      120 + ((i * 9) % 180),
      140 + ((i * 9) % 220),
      'completed',
      now() - '20 days'::interval,
      now() - '19 days'::interval,
      now() - '5 days'::interval,
      now() - (i || ' days')::interval,
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO orders (
      id,
      request_id,
      customer_id,
      artist_id,
      order_number,
      status,
      subtotal,
      platform_fee,
      total,
      payment_intent_id,
      paid_at,
      delivered_at,
      created_at,
      updated_at
    )
    VALUES (
      order_id,
      request_id,
      customer_id,
      artist_id,
      'SAMPLE-' || lpad(i::text, 4, '0'),
      'completed',
      120 + ((i * 9) % 180),
      round(((120 + ((i * 9) % 180))::numeric * 0.15), 2),
      round(((120 + ((i * 9) % 180))::numeric * 1.15), 2),
      'sample_payment_' || i,
      now() - '18 days'::interval,
      now() - '6 days'::interval,
      now() - (i || ' days')::interval,
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO reviews (
      id,
      order_id,
      customer_id,
      artist_id,
      rating,
      title,
      content,
      created_at
    )
    VALUES (
      uuid_generate_v5(uuid_ns_url(), 'giftra-sample-review-' || i),
      order_id,
      customer_id,
      artist_id,
      4 + (i % 2),
      review_titles[((i - 1) % array_length(review_titles, 1)) + 1],
      'The finished custom gift felt personal, polished, and carefully made. The sample gave us a great direction for the request.',
      now() - ((i % 30) || ' days')::interval
    )
    ON CONFLICT (order_id) DO NOTHING;
  END LOOP;
END $$;
