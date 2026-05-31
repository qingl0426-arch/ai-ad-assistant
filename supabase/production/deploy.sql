-- ============================================================
-- AI Ad Assistant — 生产环境数据库完整部署脚本
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- 或：psql -h $SUPABASE_HOST -U postgres -f production.sql
-- ============================================================

-- ═══════════════════════════════════════
-- 第一部分：核心数据表
-- ═══════════════════════════════════════

-- 1. 用户资料表（auth.users 自动触发创建）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'enterprise')),
  plan_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_profiles IS '用户资料 — auth.users JOIN 扩展';
COMMENT ON COLUMN user_profiles.plan IS '套餐等级：free | pro | enterprise';

-- 2. 广告投放数据表（核心业务表）
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
  platform TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT '',
  batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ad_traffic IS '广告投放数据 — 按日期+用户+平台维度';
COMMENT ON COLUMN ad_traffic.spend IS '消耗（元）';
COMMENT ON COLUMN ad_traffic.gmv IS '成交金额（元）';
COMMENT ON COLUMN ad_traffic.roi IS 'ROI（小数，1.5 = 150%）';

-- 3. 上传批次记录表
CREATE TABLE IF NOT EXISTS upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'partial', 'failed')),
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE upload_batches IS 'CSV 上传批次日志';

-- 4. 支付宝订单表
CREATE TABLE IF NOT EXISTS alipay_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  out_trade_no TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL
    CHECK (plan IN ('free', 'pro', 'enterprise')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'refunded', 'closed')),
  trade_no TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE alipay_orders IS '支付宝支付订单';
COMMENT ON COLUMN alipay_orders.out_trade_no IS '商户订单号（唯一）';
COMMENT ON COLUMN alipay_orders.trade_no IS '支付宝交易号';

-- 5. 订阅记录表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  provider TEXT NOT NULL DEFAULT 'alipay',
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE subscriptions IS '用户订阅历史记录';

-- ═══════════════════════════════════════
-- 第二部分：自动触发器
-- ═══════════════════════════════════════

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- user_profiles 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════
-- 第三部分：RLS 行级安全策略
-- ═══════════════════════════════════════

-- user_profiles — 用户只能查看和修改自己的资料
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;
CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON user_profiles;
CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ad_traffic — 用户只能访问自己的投放数据
ALTER TABLE ad_traffic ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "traffic_select_own" ON ad_traffic;
CREATE POLICY "traffic_select_own" ON ad_traffic
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "traffic_insert_own" ON ad_traffic;
CREATE POLICY "traffic_insert_own" ON ad_traffic
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "traffic_update_own" ON ad_traffic;
CREATE POLICY "traffic_update_own" ON ad_traffic
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "traffic_delete_own" ON ad_traffic;
CREATE POLICY "traffic_delete_own" ON ad_traffic
  FOR DELETE USING (auth.uid() = user_id);

-- upload_batches — 用户只能查看自己的上传记录
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "batches_select_own" ON upload_batches;
CREATE POLICY "batches_select_own" ON upload_batches
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "batches_insert_own" ON upload_batches;
CREATE POLICY "batches_insert_own" ON upload_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- alipay_orders — 用户只能查看自己的订单
ALTER TABLE alipay_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON alipay_orders;
CREATE POLICY "orders_select_own" ON alipay_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON alipay_orders;
CREATE POLICY "orders_insert_own" ON alipay_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- subscriptions — 用户只能查看自己的订阅
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subs_select_own" ON subscriptions;
CREATE POLICY "subs_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 第四部分：索引优化
-- ═══════════════════════════════════════

-- ad_traffic 核心查询索引
CREATE INDEX IF NOT EXISTS idx_traffic_user_date
  ON ad_traffic(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_traffic_user_platform
  ON ad_traffic(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_traffic_batch
  ON ad_traffic(batch_id) WHERE batch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_traffic_roi
  ON ad_traffic(user_id, roi DESC) WHERE roi > 0;

-- 复合索引：覆盖最常用查询（dashboard 聚合）
CREATE INDEX IF NOT EXISTS idx_traffic_dashboard
  ON ad_traffic(user_id, date, spend, gmv, roi, orders);

-- alipay_orders 查询索引
CREATE INDEX IF NOT EXISTS idx_alipay_user_status
  ON alipay_orders(user_id, status);

CREATE INDEX IF NOT EXISTS idx_alipay_trade_no
  ON alipay_orders(out_trade_no);

-- subscriptions 查询索引
CREATE INDEX IF NOT EXISTS idx_subs_user_status
  ON subscriptions(user_id, status);

-- user_profiles plan 统计索引
CREATE INDEX IF NOT EXISTS idx_profiles_plan
  ON user_profiles(plan) WHERE plan != 'free';

-- ═══════════════════════════════════════
-- 第五部分：数据归档和清理
-- ═══════════════════════════════════════

-- 归档 90 天前的投放数据到归档表
CREATE TABLE IF NOT EXISTS ad_traffic_archive (
  LIKE ad_traffic INCLUDING ALL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ad_traffic_archive IS '投放数据归档（90天前自动迁移）';

-- 归档函数
CREATE OR REPLACE FUNCTION archive_old_traffic()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH moved AS (
    DELETE FROM ad_traffic
    WHERE date < CURRENT_DATE - INTERVAL '90 days'
    RETURNING *
  )
  INSERT INTO ad_traffic_archive SELECT *, now() FROM moved;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 清理 1 年前的过期订单
CREATE OR REPLACE FUNCTION cleanup_old_orders()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM alipay_orders
  WHERE status IN ('closed', 'refunded')
    AND created_at < CURRENT_DATE - INTERVAL '365 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════
-- 第六部分：定时任务（需要 pg_cron 扩展）
-- ═══════════════════════════════════════

-- 启用 pg_cron（Supabase Pro/Team 计划可用）
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每天凌晨 3 点归档 90 天前数据
-- SELECT cron.schedule(
--   'archive-traffic-daily',
--   '0 3 * * *',
--   'SELECT archive_old_traffic();'
-- );

-- 每周日凌晨 4 点清理过期订单
-- SELECT cron.schedule(
--   'cleanup-orders-weekly',
--   '0 4 * * 0',
--   'SELECT cleanup_old_orders();'
-- );

-- ═══════════════════════════════════════
-- 第七部分：数据库备份说明
-- ═══════════════════════════════════════

-- Supabase 自动备份：
--   Pro 计划：每日自动备份，保留 7 天
--   Team 计划：每日自动备份，保留 14 天
--   Enterprise：可自定义备份策略

-- 手动备份命令（在本地终端执行）：
--   pg_dump -h db.yfnzrvhwnliviqehmoeq.supabase.co \
--           -U postgres \
--           -d postgres \
--           -Fc -f backup_$(date +%Y%m%d).dump

-- 恢复命令：
--   pg_restore -h db.xxx.supabase.co -U postgres -d postgres backup_20250131.dump

-- ═══════════════════════════════════════
-- 第八部分：性能监控视图
-- ═══════════════════════════════════════

-- 用户数据量统计
CREATE OR REPLACE VIEW user_data_stats AS
SELECT
  u.id AS user_id,
  u.email,
  p.plan,
  COUNT(a.id) AS total_records,
  MIN(a.date) AS first_date,
  MAX(a.date) AS last_date,
  COALESCE(SUM(a.spend), 0) AS total_spend,
  COALESCE(SUM(a.gmv), 0) AS total_gmv
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN ad_traffic a ON u.id = a.user_id
GROUP BY u.id, u.email, p.plan;

COMMENT ON VIEW user_data_stats IS '用户数据量统计视图';

-- 套餐分布统计
CREATE OR REPLACE VIEW plan_stats AS
SELECT
  plan,
  COUNT(*) AS user_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage
FROM user_profiles
GROUP BY plan;

COMMENT ON VIEW plan_stats IS '套餐用户分布统计';

-- ═══════════════════════════════════════
-- 执行完成
-- ═══════════════════════════════════════
DO $$ BEGIN RAISE NOTICE '生产环境数据库部署完成'; END $$;
