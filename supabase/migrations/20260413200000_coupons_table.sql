CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  percent_off integer NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (true);
