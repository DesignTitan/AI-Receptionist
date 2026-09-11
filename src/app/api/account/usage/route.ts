import { NextResponse, after } from "next/server";
import { owner, ownedCustomer, checkOrigin } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { runJobs } from "@/lib/platform/jobs";
import { enableUsageBilling } from "@/lib/platform/enable-usage";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user)
      return NextResponse.json({ error: "Sign in again." }, { status: 401 });
    const c = await ownedCustomer();
    if (!c) throw Error("Business missing");
    const { budgetCents } = await request.json();
    if (
      !Number.isInteger(budgetCents) ||
      budgetCents < 0 ||
      budgetCents > 50000
    )
      throw Error("Choose a monthly extra-minute limit between $0 and $500.");
    if (budgetCents > 0) await enableUsageBilling(c);
    const { error } = await serviceClient().rpc("set_usage_budget", {
      c_id: c.id,
      user_id: user.id,
      cents: budgetCents,
    });
    if (error)
      throw Error(
        "Limit could not be saved. It cannot be below usage already committed, including active calls.",
      );
    after(async () => {
      await runJobs();
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
