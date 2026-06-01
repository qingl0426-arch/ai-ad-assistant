const { Pool } = require("pg");
const fs = require("fs");

const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});

const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "").split(".")[0];

async function main() {
  // Try pooler connection (IPv4 compatible)
  const pool = new Pool({
    host: "aws-0-ap-southeast-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres." + projectRef,
    password: env.SUPABASE_SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    family: 4,
  });

  const sql = [
    "ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_no TEXT",
    "ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2)",
    "ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_reason TEXT",
    "ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ",
    "ALTER TABLE public.alipay_orders DROP CONSTRAINT IF EXISTS alipay_orders_status_check",
    "ALTER TABLE public.alipay_orders ADD CONSTRAINT alipay_orders_status_check CHECK (status IN ('pending', 'paid', 'refunding', 'refunded', 'closed'))",
    `CREATE TABLE IF NOT EXISTS public.payment_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event TEXT NOT NULL,
      out_trade_no TEXT,
      user_id UUID,
      plan TEXT,
      amount NUMERIC(10,2),
      payload JSONB,
      result TEXT,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    "CREATE INDEX IF NOT EXISTS idx_payment_logs_event ON public.payment_logs(event)",
    "CREATE INDEX IF NOT EXISTS idx_payment_logs_out_trade_no ON public.payment_logs(out_trade_no)",
    "CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at)",
  ];

  console.log("Connecting to pooler...");
  const client = await pool.connect();
  
  for (const stmt of sql) {
    try {
      await client.query(stmt);
      console.log("OK:", stmt.slice(0, 60) + (stmt.length > 60 ? "..." : ""));
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("duplicate")) {
        console.log("SKIP (exists):", stmt.slice(0, 60) + "...");
      } else {
        console.error("FAIL:", err.message);
      }
    }
  }

  client.release();
  await pool.end();
  console.log("\nDone!");
}

main().catch(function(err) { console.error(err); process.exit(1); });