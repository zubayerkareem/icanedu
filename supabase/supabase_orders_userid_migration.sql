-- Add user_id to orders so each order is linked to a student account
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS if not already
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop old loose policies if any
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated update orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can read all orders" ON orders;

-- Authenticated users can insert orders (user_id is set by the app)
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can read all orders
-- Admin sees all via admin panel, students see filtered by user_id in the app
CREATE POLICY "Authenticated can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update orders (admin updates status)
CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
