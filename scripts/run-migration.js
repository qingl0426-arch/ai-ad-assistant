const { Pool } = require("pg");
const fs = require("fs");
const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0,i).trim()] = l.slice(i+1).trim();
});

const password = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "").split(".")[0];

async function tryConnect(host, port, user, db, sni) {
  const cfg = { host, port, database: db, user, password, connectionTimeoutMillis: 5000 };
  if (sni) {
    cfg.ssl = { rejectUnauthorized: false, servername: sni };
  } else {
    cfg.ssl = { rejectUnauthorized: false };
  }
  const pool = new Pool(cfg);
  try {
    const c = await pool.connect();
    console.log("CONNECTED: " + user + "@" + host + ":" + port + " SNI=" + (sni||"none"));
    return { pool, client: c };
  } catch(e) {
    console.log("FAIL: " + user + "@" + host + " SNI=" + (sni||"none") + " - " + e.message);
    await pool.end().catch(function(){});
    return null;
  }
}

async function main() {
  const options = [
    { host: "aws-0-ap-southeast-1.pooler.supabase.com", port: 6543, user: "postgres", db: "postgres", sni: "db." + projectRef + ".supabase.co" },
  ];

  let conn = null;
  for (const opt of options) {
    conn = await tryConnect(opt.host, opt.port, opt.user, opt.db, opt.sni);
    if (conn) break;
  }

  if (!conn) {
    console.log("\nTrying direct DB with DNS resolution via nslookup...");
    const { execSync } = require("child_process");
    try {
      const ip = execSync("dig +short db." + projectRef + ".supabase.co A 2>/dev/null || nslookup db." + projectRef + ".supabase.co 2>/dev/null | grep 'Address:' | tail -1 | awk '{print $2}'", { encoding: "utf8" }).trim();
      if (ip) {
        console.log("Found IPv4: " + ip);
        conn = await tryConnect(ip, 5432, "postgres", "postgres", "db." + projectRef + ".supabase.co");
      }
    } catch(e) {}
  }

  if (!conn) {
    console.log("Could not connect. Please run these SQL statements in the Supabase SQL Editor:");
    console.log("https://supabase.com/dashboard/project/" + projectRef + "/sql/new");
    console.log("\n-- Copy the SQL below --");
    console.log(`
ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_no TEXT;
ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2);
ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.alipay_orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE public.alipay_orders DROP CONSTRAINT IF EXISTS alipay_orders_status_check;
ALTER TABLE public.alipay_orders ADD CONSTRAINT alipay_orders_status_check CHECK (status IN ('pending', 'paid', 'refunding', 'refunded', 'closed'));
CREATE TABLE IF NOT EXISTS public.payment_logs (
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
);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event ON public.payment_logs(event);
CREATE INDEX IF NOT EXISTS idx_payment_logs_out_trade_no ON public.payment_logs(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at);
`);
    process.exit(1);
  }

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

  for (const s of sql) {
    try {
      await conn.client.query(s);
      console.log("OK: " + s.slice(0, 70));
    } catch(e) {
      if (e.message.includes("already exists") || e.message.includes("duplicate")) {
        console.log("SKIP: " + s.slice(0, 60));
      } else {
        console.log("FAIL: " + e.message);
      }
    }
  }

  conn.client.release();
  await conn.pool.end();
  console.log("\nAll done!");
}

main().catch(function(e) { console.error(e); process.exit(1); });