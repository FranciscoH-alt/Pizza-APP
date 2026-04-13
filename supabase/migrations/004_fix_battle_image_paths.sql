-- Fix battle image paths — replace .jpg references with the actual .png files in /public/pizza/

UPDATE battles SET image_a = '/pizza/pepperoni.png',   image_b = '/pizza/cheese.png'       WHERE title = 'Pepperoni vs Cheese';
UPDATE battles SET image_a = '/pizza/pepperoni-thin.png', image_b = '/pizza/deep-dish.png' WHERE title = 'Thin Crust vs Deep Dish';
UPDATE battles SET image_a = '/restaurants/jets.png',  image_b = '/restaurants/buddys.png' WHERE title = 'Jet''s Pizza vs Buddy''s Pizza';
UPDATE battles SET image_a = '/pizza/cheese-pull.png', image_b = '/pizza/marinara.png'     WHERE title = 'Extra Cheese vs Extra Sauce';
