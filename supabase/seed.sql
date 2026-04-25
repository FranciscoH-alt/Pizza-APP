-- The Daily Slice — Seed Data
-- Run after 001_initial_schema.sql

-- ============================================================
-- BATTLES (7 days, adjust start_date to match your launch week)
-- ============================================================

INSERT INTO battles (title, option_a, option_b, image_a, image_b, description, location, start_date, end_date, status, votes_a, votes_b) VALUES
(
  'Square vs Round',
  'Square',
  'Round',
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
  '/pizza/margherita.png',
  '/pizza/meatlovers.png',
  'Simple perfection vs loaded indulgence. Where do you stand?',
  'Lake Orion, MI',
  CURRENT_DATE + 6,
  CURRENT_DATE + 6,
  'scheduled',
  0,
  0
);

-- ============================================================
-- DEALS (real local deals — Lake Orion / Rochester Hills / Auburn Hills)
-- ============================================================

INSERT INTO deals (restaurant_name, title, description, area, expiration, phone, address, link, active, sort_order) VALUES
-- Jet's Pizza
(
  'Jet''s Pizza',
  'Large Popcorn Chicken Pizza',
  'Choose from BBQ Chicken, Aloha BBQ Chicken, Buffalo Ranch Chicken, and Chicken Bacon Ranch.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 1
),
(
  'Jet''s Pizza',
  'Large Combo — $25.99',
  'Large Pizza with Premium Mozzarella & 1 Topping, Choice of Bread, & a 2-Liter Coca-Cola Product.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 2
),
(
  'Jet''s Pizza',
  'Large 1-Topping Pizza — $14.99',
  'Large Detroit-Style Pizza with Premium Mozzarella & 1 Topping.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 3
),
(
  'Jet''s Pizza',
  'Medium 1-Topping Pizza — $7.99',
  'Medium Hand Tossed Pizza with Premium Mozzarella & 1 Topping.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 4
),
(
  'Jet''s Pizza',
  'Small 1-Topping Pizza — $10.99',
  'Small Detroit-Style Pizza with Premium Mozzarella & 1 Topping.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 5
),
(
  'Jet''s Pizza',
  'Slice Combo — $6.49',
  '2 Deep Dish slices (cheese or pepperoni) and a 20oz drink.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.jetspizza.com/mi007/menu',
  true, 6
),
-- Chicago Brothers Pizza
(
  'Chicago Brothers Pizza',
  'Manager''s Special — $21.99',
  '1 large pizza (cheese + 1 topping) + breadsticks + 2-liter Coke.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://www.chicagobrotherspizza.com/event/managers-special-1699/',
  true, 7
),
(
  'Chicago Brothers Pizza',
  'Large Hand Tossed Pizza — $13.99',
  'Large hand tossed pizza with 1 item.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://www.chicagobrotherspizza.com/event/large-hand-tossed-pizza-1-item-999-copy/',
  true, 8
),
-- Hungry Howie's
(
  'Hungry Howie''s',
  'Detroit Style — $12.99',
  'Large Detroit-Style pizza.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://www.hungryhowies.com/menu/detroit-style-pizza',
  true, 9
),
(
  'Hungry Howie''s',
  'Large Pepperoni Duo — $11',
  'Large pepperoni duo pizza.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://www.hungryhowies.com/pepperoni-duo-pizza',
  true, 10
),
(
  'Hungry Howie''s',
  '25% Off Your Order',
  '25% off your total order at regular menu price.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://hungryhowies.hungerrush.com/order/menu/10#Deals',
  true, 11
),
(
  'Hungry Howie''s',
  '$8.99 Large 1-Topping Pizza',
  'Large round 1-topping pizza. Online carryout only.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://hungryhowies.hungerrush.com/order/menu/10#Deals',
  true, 12
),
(
  'Hungry Howie''s',
  '$11.99 Large 2-Topping Pizza',
  'Large round 2-topping pizza.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://hungryhowies.hungerrush.com/order/menu/10#Deals',
  true, 13
),
(
  'Hungry Howie''s',
  '$7.99 Small 2-Topping Pizza',
  'Small round 2-topping pizza.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://hungryhowies.hungerrush.com/order/menu/10#Deals',
  true, 14
),
(
  'Hungry Howie''s',
  '$5 Howie Roll Deal',
  'Howie Roll™ and 20oz Pepsi.',
  'Rochester Hills',
  NULL, NULL, NULL,
  'https://hungryhowies.hungerrush.com/order/menu/10#Deals',
  true, 15
),
-- Guido's Pizza
(
  'Guido''s Pizza',
  'Lunch Special — $9.99',
  'Baby Guido + Pop.',
  'Auburn Hills',
  NULL, NULL, NULL,
  'https://www.guidospizzaauburnhills.com/view_coupon/614/Baby-Guido-Pop-9-99',
  true, 16
),
(
  'Guido''s Pizza',
  'Old World Pepperoni L Deep Dish — $24.95',
  'Large Deep Dish with old world style pepperoni combo.',
  'Auburn Hills',
  NULL, NULL, NULL,
  'https://www.guidospizzaauburnhills.com/view_coupon/1302260/Big-G-Old-World-Style-Pepperoni-Combo-24-95',
  true, 17
),
-- Little Caesars
(
  'Little Caesars',
  '$5 Off Your Order of $30+',
  'Code applied at checkout. Use code 5OFF30.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://littlecaesars.com/en-us/deals/',
  true, 18
),
-- Cottage Inn Pizza
(
  'Cottage Inn Pizza',
  'New York Style 16" X-Large 2-Topping — $14.99',
  'Limited time offer. New York style 16" X-Large pizza with any 2 toppings.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.cottageinn.com/?uniqueStoreIdentifier=LAKEORION&security_token=undefined#/',
  true, 19
),
(
  'Cottage Inn Pizza',
  'Large 1-Topping — $11.99',
  'Any large 1-topping pizza.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.cottageinn.com/?uniqueStoreIdentifier=LAKEORION&security_token=undefined#/',
  true, 20
),
(
  'Cottage Inn Pizza',
  'Brookie Combo — $27.99',
  'Any large gourmet pizza and a Brookie.',
  'Lake Orion',
  NULL, NULL, NULL,
  'https://order.cottageinn.com/?uniqueStoreIdentifier=LAKEORION&security_token=undefined#/',
  true, 21
);
