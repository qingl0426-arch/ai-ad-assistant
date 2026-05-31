-- Ad traffic data table
CREATE TABLE IF NOT EXISTS ad_traffic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  gmv DECIMAL(14,2) NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  roi DECIMAL(8,4) NOT NULL DEFAULT 0,
  platform TEXT DEFAULT '',
  campaign TEXT DEFAULT '',
  batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ad_traffic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON ad_traffic
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_ad_traffic_user_date ON ad_traffic(user_id, date DESC);
CREATE INDEX idx_ad_traffic_batch ON ad_traffic(batch_id);

-- Upload batches log
CREATE TABLE IF NOT EXISTS upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own batches" ON upload_batches
  FOR ALL USING (auth.uid() = user_id);

-- Profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
