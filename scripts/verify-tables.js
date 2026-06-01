const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
Promise.all([
  s.from("alipay_orders").select("*").limit(1),
  s.from("payment_logs").select("*").limit(1),
]).then(function(results) {
  console.log("alipay_orders columns:", results[0].data && results[0].data[0] ? Object.keys(results[0].data[0]) : "no rows (table exists)");
  console.log("payment_logs columns:", results[1].data && results[1].data[0] ? Object.keys(results[1].data[0]) : "no rows (table exists)");
  console.log("alipay_orders error:", results[0].error ? results[0].error.message : "none");
  console.log("payment_logs error:", results[1].error ? results[1].error.message : "none");
});