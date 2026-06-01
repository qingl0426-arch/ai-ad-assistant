const fs = require("fs");
const env = {};
fs.readFileSync("/opt/ai-ad-assistant/.env", "utf8").split("\n").forEach(function(l) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0,i).trim()] = l.slice(i+1).trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  // Try using Supabase Management API to run SQL
  const projectRef = url.replace("https://", "").split(".")[0];
  
  // First, check if the tables exist via REST
  console.log("Checking alipay_orders...");
  const r1 = await fetch(url + "/rest/v1/alipay_orders?limit=0", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });
  console.log("alipay_orders status:", r1.status);
  
  console.log("Checking payment_logs...");
  const r2 = await fetch(url + "/rest/v1/payment_logs?limit=0", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
  });
  console.log("payment_logs status:", r2.status);

  if (r2.status === 404) {
    console.log("\npayment_logs table does not exist. It needs to be created.");
    console.log("\n=== SQL to run in Supabase SQL Editor ===");
    console.log("URL: https://supabase.com/dashboard/project/" + projectRef + "/sql/new");
    console.log("");
  }
}

main().catch(console.error);