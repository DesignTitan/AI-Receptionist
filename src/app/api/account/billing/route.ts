import { assertBillingEnvironment } from "@/lib/platform/billing-environment";
import { NextResponse } from "next/server";
import { checkOrigin, ownedCustomer } from "@/lib/platform/server";
import { stripe } from "@/lib/platform/billing";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const c = await ownedCustomer();
    await assertBillingEnvironment();
    if (!c?.stripe_customer_id)
      throw Error("Billing is available after checkout.");
    const configuration = process.env.STRIPE_PORTAL_CONFIGURATION;
    if (!configuration) throw Error("Billing portal needs configuration.");
    const session = await stripe(
      "billing_portal/sessions",
      new URLSearchParams({
        customer: c.stripe_customer_id,
        configuration,
        return_url: `${env.siteUrl}/account`,
      }),
    );
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Billing unavailable.",
      },
      { status: 400 },
    );
  }
}
