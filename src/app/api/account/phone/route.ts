import { NextResponse } from "next/server";
import { checkOrigin, owner } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import type { BusinessConfig } from "@/lib/platform/model";
import { resolvePhoneRoute, validatePhoneSettings, type PhoneConnection, type PhoneSettings } from "@/lib/platform/phone-settings";
import { phoneSettingsRevision as revision } from "@/lib/platform/phone-settings-revision";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
type CustomerRow = { id: string; config: BusinessConfig; status: string; billing_status: string | null; phone_number: string | null; phone_settings: unknown; period_start: string | null; overage_budget_cents: number };
type ConnectionRow = PhoneConnection & { ai_number: string | null };
async function load(userId: string) {
  const db = serviceClient();
  const { data: customer, error } = await db.from("customers")
    .select("id,config,status,billing_status,phone_number,phone_settings,period_start,overage_budget_cents")
    .eq("owner_id", userId).maybeSingle();
  if (error) throw Error("Phone settings are not available yet. Please try again later.");
  if (!customer) return null;
  // This service-only table is never selected with '*'. No credentials enter the response.
  const result = await db.from("customer_phone_connections")
    .select("provider,inbound_number,ai_number,status,verified_at")
    .eq("customer_id", customer.id).maybeSingle();
  if (result.error) throw Error("The phone connection could not be checked. Please try again.");
  const usage = await db.from("usage_periods").select("used_minutes,reserved_minutes,included_minutes,overage_cents,starts_at,ends_at")
    .eq("customer_id", customer.id).eq("starts_at", customer.period_start ?? "1970-01-01").maybeSingle();
  const p = usage.data;
  const usageKnown = !usage.error && p && Date.parse(p.starts_at) <= Date.now() && Date.parse(p.ends_at) > Date.now() && p.overage_cents > 0;
  const aiCapacity = usageKnown ? p.used_minutes + p.reserved_minutes + 5 <= p.included_minutes + Math.floor(customer.overage_budget_cents / p.overage_cents) : false;
  return { db, customer: customer as CustomerRow, connection: result.data as ConnectionRow | null, aiCapacity, usageKnown: Boolean(usageKnown) };
}
function protectedNumbers(customer: CustomerRow, connection: ConnectionRow | null) {
  return [customer.config.phone, customer.phone_number, connection?.inbound_number, connection?.ai_number];
}
function snapshot(customer: CustomerRow, connection: ConnectionRow | null, settings: PhoneSettings, aiCapacity: boolean, usageKnown: boolean) {
  const checkedAt = new Date();
  const serviceActive = customer.status === "live" && customer.billing_status === "active";
  const verified = connection?.status === "ready" && !!connection.verified_at && Number.isFinite(Date.parse(connection.verified_at))
    && /^\+[1-9]\d{7,14}$/.test(connection.inbound_number ?? "") && /^\+[1-9]\d{7,14}$/.test(connection.ai_number ?? "");
  return {
    settings,
    connection: {
      status: connection?.status ?? "not_connected",
      provider: connection?.provider ?? null,
      inbound_number: connection?.inbound_number ?? null,
      verified_at: connection?.verified_at ?? null,
    },
    timezone: customer.config.timezone,
    serviceActive,
    routingAvailable: serviceActive && verified && (process.env.INBOUND_SESSION_SECRET?.length ?? 0) >= 32,
    aiAvailable: Boolean(serviceActive && verified && (process.env.INBOUND_SESSION_SECRET?.length ?? 0) >= 32 && aiCapacity),
    usageKnown,
    revision: revision(customer.phone_settings),
    checkedAt: checkedAt.toISOString(),
    route: resolvePhoneRoute(settings, customer.config.timezone, checkedAt),
  };
}
export async function GET() {
  try {
    const user = await owner();
    if (!user) return NextResponse.json({ error: "Sign in again to view phone settings." }, { status: 401, headers });
    const loaded = await load(user.id);
    if (!loaded) return NextResponse.json({ error: "Complete your business details first." }, { status: 404, headers });
    const { customer, connection, aiCapacity, usageKnown } = loaded;
    const settings = validatePhoneSettings(customer.phone_settings ?? {}, customer.config, protectedNumbers(customer, connection));
    return NextResponse.json(snapshot(customer, connection, settings, aiCapacity, usageKnown), { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Phone settings could not load." }, { status: 503, headers });
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user) return NextResponse.json({ error: "Sign in again to save phone settings." }, { status: 401, headers });
    const raw = await request.text();
    if (raw.length > 30000) throw Error("Phone settings are too large.");
    let body: { settings: unknown; revision: unknown };
    try { body = JSON.parse(raw); } catch { throw Error("Send valid phone settings."); }
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !["settings", "revision"].includes(key))) throw Error("Only phone settings can be changed here.");
    if (typeof body.revision !== "string" || !/^[a-f0-9]{64}$/.test(body.revision)) throw Error("Reload phone settings before saving.");
    const loaded = await load(user.id);
    if (!loaded) return NextResponse.json({ error: "Complete your business details first." }, { status: 404, headers });
    const { db, customer, connection, aiCapacity, usageKnown } = loaded;
    if (body.revision !== revision(customer.phone_settings)) return NextResponse.json({ error: "Phone settings changed in another window. Reload them before saving." }, { status: 409, headers });
    const settings = validatePhoneSettings(body.settings, customer.config, protectedNumbers(customer, connection));
    if (settings.override && Date.parse(settings.override.expiresAt) > Date.now() + 30 * 86400000) throw Error("Temporary changes can last up to 30 days. Use a vacation schedule for a longer period.");
    if (settings.override && Date.parse(settings.override.expiresAt) <= Date.now()) settings.override = null;
    const result = await db.from("customers").update({ phone_settings: settings })
      .eq("id", customer.id).eq("owner_id", user.id)
      .eq("phone_settings", JSON.stringify(customer.phone_settings ?? {}))
      .select("id").maybeSingle();
    if (result.error) throw Error("Phone settings could not be saved. Please try again.");
    if (!result.data) return NextResponse.json({ error: "Phone settings changed while saving. Reload them and try again." }, { status: 409, headers });
    return NextResponse.json(snapshot({ ...customer, phone_settings: settings }, connection, settings, aiCapacity, usageKnown), { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Phone settings could not be saved." }, { status: 400, headers });
  }
}
