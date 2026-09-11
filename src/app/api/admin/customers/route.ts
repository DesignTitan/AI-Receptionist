import { runJobs } from "@/lib/platform/jobs";
import { after } from "next/server";
import { NextResponse } from "next/server";
import { checkOrigin, requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { phone, validateConfig } from "@/lib/platform/model";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireStaff();
    const b = await request.json();
    if (!["provisioning", "live", "paused"].includes(b.status))
      throw Error(
        "Choose provisioning, live or paused. Payment status is managed by Stripe.",
      );
    const db = serviceClient();
    const { data: c, error } = await db
      .from("customers")
      .select("status,billing_status,config")
      .eq("id", b.id)
      .single();
    if (error || !c) throw Error("Customer not found.");
    if (c.status === "draft")
      throw Error("Payment must be received before setup.");
    if (b.status === "live" || b.status === "provisioning") {
      if (c.config.setupPending) throw Error("The customer must complete business setup first.");
      validateConfig(c.config);
    }
    if (b.status === "live") {
      if (c.billing_status !== "active")
        throw Error("An active paid subscription is required.");
      if (!b.tested || !/^\d+$/.test(b.agent_id) || !/^\d+$/.test(b.number_id))
        throw Error("Enter the voice IDs and confirm the end-to-end test.");
      if (
        !process.env.RESEND_API_KEY ||
        !process.env.EMAIL_FROM ||
        !process.env.OMNIDIMENSION_API_KEY
      )
        throw Error("Connect production email and voice before going live.");
      const response=await fetch(`https://backend.omnidim.io/api/v1/agents/${b.agent_id}`,{headers:{Authorization:`Bearer ${process.env.OMNIDIMENSION_API_KEY}`},cache:'no-store'});
      if(!response.ok)throw Error('Could not verify the agent call-duration limit.');
      const raw=await response.json();const agent=raw.data??raw;
      const limit=Number(agent.transcriber?.max_call_duration_in_sec??agent.max_call_duration_in_sec);
      if(!Number.isFinite(limit)||limit<=0||limit>300)throw Error('Set and verify the agent maximum call duration to 300 seconds before activation.');
      phone(b.phone_number);
    }
    const { error: write } = await db.rpc('activate_customer', {
      c_id: b.id, target_status: b.status, agent: b.agent_id || null,
      number: b.number_id || null, telephone: b.phone_number ? phone(b.phone_number) : null,
    });
    if (write) throw Error('Could not save setup. Check billing and ensure this line is not assigned to another customer.');
    after(async () => {
      await runJobs();
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
