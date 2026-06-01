const fs = require("fs");
const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0,i).trim()] = l.slice(i+1).trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  // Try to select refund columns to check if they exist
  const r = await fetch(url + "/rest/v1/alipay_orders?select=refund_no,refund_amount,refund_reason,refunded_at&limit=1", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });
  const text = await r.text();
  console.log("Status:", r.status);
  console.log("Response:", text.slice(0, 200));
}

main().catch(console.error);