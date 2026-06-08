-- ============================================
-- 008_product_trends.sql
-- 爆品雷达 - 商品趋势数据表
-- 用于存储各平台商品趋势分析数据
-- ============================================

-- 创建表
CREATE TABLE IF NOT EXISTS product_trends (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  platform              TEXT NOT NULL DEFAULT '',
  product_name          TEXT NOT NULL,
  category              TEXT NOT NULL DEFAULT '',
  price                 NUMERIC(12,2) NOT NULL DEFAULT 0,
  sales_7d              INTEGER NOT NULL DEFAULT 0,
  gmv_7d                NUMERIC(12,2) NOT NULL DEFAULT 0,
  sales_growth_rate     NUMERIC(8,2) NOT NULL DEFAULT 0,
  gmv_growth_rate       NUMERIC(8,2) NOT NULL DEFAULT 0,
  comment_growth_rate   NUMERIC(8,2) NOT NULL DEFAULT 0,
  favorite_growth_rate  NUMERIC(8,2) NOT NULL DEFAULT 0,
  profit_margin_estimate NUMERIC(5,4) NOT NULL DEFAULT 0,
  competition_level     TEXT NOT NULL DEFAULT '中' CHECK (competition_level IN ('低', '中', '高')),
  hot_score             INTEGER NOT NULL DEFAULT 0 CHECK (hot_score >= 0 AND hot_score <= 100),
  trend_status          TEXT NOT NULL DEFAULT '稳定' CHECK (trend_status IN ('爆发', '上升', '稳定', '下降')),
  source                TEXT NOT NULL DEFAULT 'manual',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_product_trends_user_id    ON product_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_product_trends_platform   ON product_trends(platform);
CREATE INDEX IF NOT EXISTS idx_product_trends_category   ON product_trends(category);
CREATE INDEX IF NOT EXISTS idx_product_trends_hot_score   ON product_trends(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_trends_created_at  ON product_trends(created_at DESC);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_product_trends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_trends_updated_at ON product_trends;
CREATE TRIGGER trg_product_trends_updated_at
  BEFORE UPDATE ON product_trends
  FOR EACH ROW EXECUTE FUNCTION update_product_trends_updated_at();

-- RLS
ALTER TABLE product_trends ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的商品趋势数据
DROP POLICY IF EXISTS "Users can view own product trends" ON product_trends;
CREATE POLICY "Users can view own product trends" ON product_trends
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的数据
DROP POLICY IF EXISTS "Users can insert own product trends" ON product_trends;
CREATE POLICY "Users can insert own product trends" ON product_trends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的数据
DROP POLICY IF EXISTS "Users can update own product trends" ON product_trends;
CREATE POLICY "Users can update own product trends" ON product_trends
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的数据
DROP POLICY IF EXISTS "Users can delete own product trends" ON product_trends;
CREATE POLICY "Users can delete own product trends" ON product_trends
  FOR DELETE USING (auth.uid() = user_id);

-- 管理员可查看全部（通过 service_role 绕过 RLS）
-- 无需额外策略，service_role 调用时 RLS 自动绕过
