import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";
import { serviceClient } from "@/lib/supabase";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import type { Customer, CustomerBooking } from "./model";

export const OWNER_COOKIE = "receptionist_owner";
export function authClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey)
    throw Error("Owner accounts are not available yet.");
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function owner() {
  const token = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!token || !isSupabaseConfigured()) return null;
  const { data, error } = await authClient().auth.getUser(token);
  return error ? null : data.user;
}
export async function requireOwner() {
  const user = await owner();
  if (!user) redirect("/account/login");
  return user;
}
export async function requireStaff() {
  if (!(await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value)))
    throw Error("Staff sign-in required.");
}
export async function ownedCustomer(id?: string) {
  const user = await requireOwner();
  let query = serviceClient()
    .from("customers")
    .select("*")
    .eq("owner_id", user.id);
  if (id) query = query.eq("id", id);
  const { data, error } = await query.maybeSingle();
  if (error) throw Error("We couldn't load your business. Please try again.");
  return data as Customer | null;
}
export async function publicCustomer(slug: string) {
  const { data, error } = await serviceClient()
    .from("customers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "live")
    .eq("billing_status", "active")
    .maybeSingle();
  if (error) throw Error("Booking is temporarily unavailable.");
  return data as Customer | null;
}
export async function bookingsFor(customerId: string) {
  const { data, error } = await serviceClient()
    .from("customer_bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false })
    .limit(100);
  if (error) throw Error("We couldn't load bookings.");
  return data as CustomerBooking[];
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw Error("Please submit this form from our website.");
}
