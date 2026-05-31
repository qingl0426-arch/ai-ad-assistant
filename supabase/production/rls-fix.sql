-- ============================================================
-- RLS 强制修复脚本
-- 在 Supabase SQL Editor 中运行
-- ============================================================

-- 强制启用所有表的 RLS
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE ad_traffic FORCE ROW LEVEL SECURITY;
ALTER TABLE upload_batches FORCE ROW LEVEL SECURITY;
ALTER TABLE alipay_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;

-- 删除所有旧策略
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 重建精准策略

-- ad_traffic
CREATE POLICY "traffic_select_own" ON ad_traffic FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "traffic_insert_own" ON ad_traffic FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "traffic_update_own" ON ad_traffic FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "traffic_delete_own" ON ad_traffic FOR DELETE USING (auth.uid() = user_id);

-- user_profiles
CREATE POLICY "profiles_select_own" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- upload_batches
CREATE POLICY "batches_select_own" ON upload_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "batches_insert_own" ON upload_batches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- alipay_orders
CREATE POLICY "orders_select_own" ON alipay_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON alipay_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "subs_select_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DO $$ BEGIN RAISE NOTICE 'RLS 策略重建完成'; END $$;
