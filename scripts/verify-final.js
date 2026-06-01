const fs = require("fs");
const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0,i).trim()] = l.slice(i+1).trim();
});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const r1 = await fetch(url + "/rest/v1/payment_logs?limit=0", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });
  console.log("payment_logs:", r1.status === 200 ? "OK 创建成功" : "状态 " + r1.status);

  const r2 = await fetch(url + "/rest/v1/alipay_orders?select=refund_no,refund_amount,refund_reason,refunded_at&limit=1", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });
  console.log("refund 字段:", r2.status === 200 ? "OK 字段已添加" : "状态 " + r2.status);
}
main();