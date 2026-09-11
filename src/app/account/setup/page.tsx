import { Frame } from "@/components/platform/frame";
import { BusinessSetupForm } from "@/components/platform/business-setup-form";
import { ownedCustomer } from "@/lib/platform/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Setup() {
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  if (c.status !== "paid" || c.billing_status !== "active") redirect("/account");
  return <Frame eyebrow="Your dashboard · Business setup" title="Let’s make it yours." description="Your purchase is complete. Add your business details so we can prepare your booking page and phone line.">
    <BusinessSetupForm customer={c} plan={c.plan} />
  </Frame>;
}
