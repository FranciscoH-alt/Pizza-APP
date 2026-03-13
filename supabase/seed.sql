-- The Daily Slice — Seed Data
-- Run after 001_initial_schema.sql

-- ============================================================
-- BATTLES (7 days, adjust start_date to match your launch week)
-- ============================================================

INSERT INTO battles (title, option_a, option_b, image_a, image_b, description, location, start_date, end_date, status, votes_a, votes_b) VALUES
(
  'Detroit Square vs New York Round',
  'Detroit Square',
  'New York Round',
  '/pizza/square.png',
  '/pizza/round.png',
  'The ultimate Michigan vs NYC debate. Which style owns your heart?',
  'Lake Orion, MI',
  CURRENT_DATE,
  CURRENT_DATE,
  'active',
  247,
  183
),
(
  'Pepperoni vs Cheese',
  'Pepperoni',
  'Classic Cheese',
  '/pizza/pepperoni.jpg',
  '/pizza/cheese.jpg',
  'The eternal question. Do you need the meat, or does the cheese speak for itself?',
  'Lake Orion, MI',
  CURRENT_DATE + 1,
  CURRENT_DATE + 1,
  'scheduled',
  0,
  0
),
(
  'Thin Crust vs Deep Dish',
  'Thin Crust',
  'Deep Dish',
  '/pizza/thin-crust.jpg',
  '/pizza/deep-dish.jpg',
  'Crispy and light vs hearty and loaded. Which is the real pizza?',
  'Lake Orion, MI',
  CURRENT_DATE + 2,
  CURRENT_DATE + 2,
  'scheduled',
  0,
  0
),
(
  'Jet''s Pizza vs Buddy''s Pizza',
  'Jet''s Pizza',
  'Buddy''s Pizza',
  '/pizza/jets.jpg',
  '/pizza/buddys.jpg',
  'Two Michigan legends. One winner. Vote your loyalty.',
  'Lake Orion, MI',
  CURRENT_DATE + 3,
  CURRENT_DATE + 3,
  'scheduled',
  0,
  0
),
(
  'Crispy Bottom vs Soft Bottom',
  'Crispy Bottom',
  'Soft Bottom',
  '/pizza/crispy-bottom.jpg',
  '/pizza/soft-bottom.jpg',
  'The underdog debate. How do you like your crust to land?',
  'Lake Orion, MI',
  CURRENT_DATE + 4,
  CURRENT_DATE + 4,
  'scheduled',
  0,
  0
),
(
  'Extra Cheese vs Extra Sauce',
  'Extra Cheese',
  'Extra Sauce',
  '/pizza/extra-cheese.jpg',
  '/pizza/extra-sauce.jpg',
  'When you customize, where do you go heavy? Cheese or sauce — pick one.',
  'Lake Orion, MI',
  CURRENT_DATE + 5,
  CURRENT_DATE + 5,
  'scheduled',
  0,
  0
),
(
  'Margherita vs Meat Lovers',
  'Classic Margherita',
  'Meat Lovers',
  '/pizza/margherita.jpg',
  '/pizza/meat-lovers.jpg',
  'Simple perfection vs loaded indulgence. Where do you stand?',
  'Lake Orion, MI',
  CURRENT_DATE + 6,
  CURRENT_DATE + 6,
  'scheduled',
  0,
  0
);

-- ============================================================
-- DEALS (real local deals — Lake Orion / Rochester Hills area)
-- ============================================================

INSERT INTO deals (restaurant_name, title, description, area, expiration, phone, address, link, active, sort_order) VALUES
(
  'Jet''s Pizza',
  '$5 Off Any $25+ Order',
  'Get $5 off any online order of $25 or more. Use code FIVE25 at checkout.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  'https://www.jetspizza.com',
  true,
  1
),
(
  'Chicago Brothers Pizza',
  'Manager''s Special — $21.99',
  '1 large pizza (cheese + 1 topping) + breadsticks + 2-liter Coke. Also: any 2 oven-baked subs for $16.99.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  2
),
(
  'Hungry Howie''s',
  'Large Round Pizza — $7.99',
  'Any large 1-topping round pizza, online carryout only.',
  'Rochester Hills',
  NULL,
  NULL,
  NULL,
  'https://www.hungryhowies.com',
  true,
  3
),
(
  'Hungry Howie''s',
  'Detroit Style $12.99',
  'Large 1-topping Detroit style pizza with sauce on top. Use code 29203 online.',
  'Rochester Hills',
  NULL,
  NULL,
  NULL,
  'https://www.hungryhowies.com',
  true,
  4
),
(
  'Little Caesars',
  '$5 Off Any $30+ Order',
  'Add items to cart — discount applies at checkout. Use code 5OFF30.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  'https://littlecaesars.com/en-us/deals/',
  true,
  5
),
(
  'Guido''s Pizza',
  'Buy One Get One 50% Off',
  'Buy one pizza, get a second pizza at 50% off. Use coupon code G-MSC11_1.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  'https://www.guidospizzaauburnhills.com/',
  true,
  6
),
(
  'Guido''s Pizza',
  'Lunch Special',
  'Baby Guido (cheese + 2 toppings) + 20oz Coke. Use coupon code G-PZ20.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  'https://www.guidospizzaauburnhills.com/',
  true,
  7
),
(
  'Guido''s Pizza',
  'Old World Pepperoni XL — $17.95',
  'XL Round, 12 slices, cheese + old world style pepperoni. Serves 3–4. Code: G-PZ78.',
  'Lake Orion',
  NULL,
  NULL,
  NULL,
  'https://www.guidospizzaauburnhills.com/',
  true,
  8
);
