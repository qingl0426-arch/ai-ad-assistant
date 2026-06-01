const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Read .env file
const envContent = fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    env[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing required env vars");
  process.exit(1);
}

console.log("Connecting to:", supabaseUrl);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  // First try: use pg to run raw SQL via direct connection
  const { Pool } = require("pg");
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const pool = new Pool({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: serviceKey,
    ssl: { rejectUnauthorized: false },
  });

  const sql = `
CREATE TABLE IF NOT EXISTS public.alipay_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  out_trade_no TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunding', 'refunded', 'closed')),
  trade_no TEXT,
  refund_no TEXT,
  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_alipay_orders_user_id ON public.alipay_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_alipay_orders_out_trade_no ON public.alipay_orders(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_alipay_orders_status ON public.alipay_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event ON public.payment_logs(event);
CREATE INDEX IF NOT EXISTS idx_payment_logs_out_trade_no ON public.payment_logs(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at);
`;

  try {
    await pool.query(sql);
    console.log("Tables created successfully via pg!");
  } catch (err) {
    console.error("pg connection failed:", err.message);
    console.log("Trying Supabase REST API...");

    // Fallback: use Supabase REST API
    const tables = [
      {
        name: "alipay_orders",
        schema: "public",
        columns: [
          { name: "id", type: "uuid", default_value: "gen_random_uuid()", is_identity: false },
          { name: "out_trade_no", type: "text" },
          { name: "user_id", type: "uuid" },
          { name: "plan", type: "text", default_value: "pro" },
          { name: "amount", type: "numeric(10,2)", default_value: "0" },
          { name: "status", type: "text", default_value: "pending" },
          { name: "trade_no", type: "text" },
          { name: "refund_no", type: "text" },
          { name: "refund_amount", type: "numeric(10,2)" },
          { name: "refund_reason", type: "text" },
          { name: "paid_at", type: "timestamptz" },
          { name: "refunded_at", type: "timestamptz" },
          { name: "created_at", type: "timestamptz", default_value: "now()" },
        ],
      },
      {
        name: "payment_logs",
        schema: "public",
        columns: [
          { name: "id", type: "uuid", default_value: "gen_random_uuid()", is_identity: false },
          { name: "event", type: "text" },
          { name: "out_trade_no", type: "text" },
          { name: "user_id", type: "uuid" },
          { name: "plan", type: "text" },
          { name: "amount", type: "numeric(10,2)" },
          { name: "payload", type: "jsonb" },
          { name: "result", type: "text" },
          { name: "error", type: "text" },
          { name: "created_at", type: "timestamptz", default_value: "now()" },
        ],
      },
    ];

    for (const table of tables) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(table),
      });
      console.log(`${table.name}: ${res.status} ${res.statusText}`);
    }
  }

  await pool.end();

  // Verify
  console.log("\nVerifying...");
  const { data: orders, error: oErr } = await supabase
    .from("alipay_orders")
    .select("count", { count: "exact", head: true });
  console.log("alipay_orders:", oErr ? `ERROR: ${oErr.message}` : "OK");

  const { data: logs, error: lErr } = await supabase
    .from("payment_logs")
    .select("count", { count: "exact", head: true });
  console.log("payment_logs:", lErr ? `ERROR: ${lErr.message}` : "OK");
}

main().catch(console.error);