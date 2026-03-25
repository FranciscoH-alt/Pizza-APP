-- Update Hungry Howie's round deal
UPDATE deals
SET
  title = 'Large Pepperoni Duo — $11',
  description = 'Large pepperoni duo, use code HOWIE1 online.'
WHERE restaurant_name = 'Hungry Howie''s'
  AND title = 'Large Round Pizza — $7.99';
