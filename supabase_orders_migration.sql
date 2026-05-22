-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste & run

CREATE TABLE IF NOT EXISTS orders (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id    text,
  product_name  text        NOT NULL,
  product_price numeric     NOT NULL,
  customer_name text        NOT NULL,
  phone         text        NOT NULL,
  address       text        NOT NULL,
  shipping_type text        NOT NULL CHECK (shipping_type IN ('inside', 'outside')),
  shipping_cost numeric     NOT NULL,
  total_price   numeric     NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone (guest or logged-in) can place an order
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can read orders
CREATE POLICY "Authenticated users can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update order status
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
