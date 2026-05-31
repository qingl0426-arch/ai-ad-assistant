-- Alipay orders table
CREATE TABLE IF NOT EXISTS alipay_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  out_trade_no TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  trade_no TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alipay_orders_user ON alipay_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_alipay_orders_trade ON alipay_orders(out_trade_no);

-- Update user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ;
