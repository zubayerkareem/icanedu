-- Run in Supabase SQL Editor → New Query
-- Extends the orders table to support course purchases

-- Add order type column
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'product';

-- Make shipping fields optional (course orders are digital, no shipping needed)
ALTER TABLE orders
  ALTER COLUMN address       DROP NOT NULL,
  ALTER COLUMN shipping_type DROP NOT NULL,
  ALTER COLUMN shipping_cost SET DEFAULT 0;
