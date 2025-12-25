-- Create sample flyers and products
DO $$
DECLARE
  merchant_id uuid;
  flyer1_id uuid;
  flyer2_id uuid;
  flyer3_id uuid;
BEGIN
  -- Get first merchant
  SELECT id INTO merchant_id FROM merchants LIMIT 1;

  IF merchant_id IS NOT NULL THEN
    -- Create flyers
    INSERT INTO flyers (id, merchant_id, title, description, image_url, is_active, expires_at)
    VALUES
      (uuid_generate_v4(), merchant_id, '신선한 과일 대특가!', '신선한 제철 과일을 특별한 가격에 만나보세요', 'https://picsum.photos/seed/flyer1/800/600', true, NOW() + INTERVAL '30 days')
    RETURNING id INTO flyer1_id;

    -- Add products to first flyer
    INSERT INTO flyer_products (flyer_id, product_name, price, original_price, unit, promotion, category, display_order)
    VALUES
      (flyer1_id, '사과', 3900, 5900, '1kg', '33% 할인', 'fruits', 1),
      (flyer1_id, '배', 4900, 7900, '1kg', '38% 할인', 'fruits', 2),
      (flyer1_id, '귤', 2900, 4900, '1kg', '41% 할인', 'fruits', 3),
      (flyer1_id, '바나나', 1900, 2900, '1송이', '35% 할인', 'fruits', 4);

    -- Create second flyer
    INSERT INTO flyers (id, merchant_id, title, description, image_url, is_active, expires_at)
    VALUES
      (uuid_generate_v4(), merchant_id, '생활용품 특가전', '필수 생활용품을 저렴하게 구매하세요', 'https://picsum.photos/seed/flyer2/800/600', true, NOW() + INTERVAL '14 days')
    RETURNING id INTO flyer2_id;

    -- Add products to second flyer
    INSERT INTO flyer_products (flyer_id, product_name, price, original_price, unit, promotion, category, display_order)
    VALUES
      (flyer2_id, '세탁세제', 5900, 8900, '3L', '2+1 행사', 'household', 1),
      (flyer2_id, '주방세제', 2900, 4500, '1L', '1+1 행사', 'household', 2),
      (flyer2_id, '휴지', 9900, 14900, '30롤', '대용량 특가', 'household', 3),
      (flyer2_id, '물티슈', 7900, 11900, '10팩', '33% 할인', 'household', 4);

    -- Create third flyer
    INSERT INTO flyers (id, merchant_id, title, description, image_url, is_active, expires_at)
    VALUES
      (uuid_generate_v4(), merchant_id, '치킨 & 피자 할인', '인기 메뉴를 특별 가격에!', 'https://picsum.photos/seed/flyer3/800/600', true, NOW() + INTERVAL '7 days')
    RETURNING id INTO flyer3_id;

    -- Add products to third flyer
    INSERT INTO flyer_products (flyer_id, product_name, price, original_price, unit, promotion, category, display_order)
    VALUES
      (flyer3_id, '후라이드 치킨', 13900, 17900, '1마리', '주중 특가', 'food', 1),
      (flyer3_id, '양념 치킨', 14900, 18900, '1마리', '주중 특가', 'food', 2),
      (flyer3_id, '콤보 피자', 18900, 25900, 'L', '27% 할인', 'food', 3),
      (flyer3_id, '음료 세트', 3900, 6900, '2L', '치킨 주문시', 'beverage', 4);

    RAISE NOTICE 'Created 3 flyers with products successfully!';
  ELSE
    RAISE NOTICE 'No merchants found. Please create merchants first.';
  END IF;
END $$;
