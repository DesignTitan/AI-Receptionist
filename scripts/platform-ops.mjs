import { createClient } from "@supabase/supabase-js";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
for (const [label, query] of [
  [
    "Customer setup",
    db
      .from("customers")
      .select("id,business_name,status,provision_error")
      .neq("status", "live"),
  ],
  [
    "Failed or interrupted jobs",
    db
      .from("customer_jobs")
      .select("id,kind,state,attempts,error,created_at")
      .in("state", ["working", "failed"]),
  ],
  [
    "Failed calls",
    db
      .from("customer_bookings")
      .select("id,customer_id,call_status,created_at")
      .eq("call_status", "failed"),
  ],
]) {
  const { data, error } = await query;
  if (error) throw error;
  console.log(label);
  console.table(data);
}
