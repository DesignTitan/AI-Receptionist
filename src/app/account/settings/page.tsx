import { ownedCustomer } from "@/lib/platform/server";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { AccountSettings } from "@/components/platform/account-settings";
export const dynamic = "force-dynamic";
export default async function Settings({searchParams}:{searchParams:Promise<{preview?:string}>}) {
  if(process.env.NODE_ENV === "development" && (await searchParams).preview === "settings")
    return <AccountSettings name="Bubs" email="bubs@example.com" plan="busy" timezone="America/Detroit" billingAvailable={false} preview />;
  const c = await ownedCustomer();
  if(!c) redirect("/start");
  return <AccountSettings name={c.config.contactName ?? ""} email={c.owner_email} plan={c.plan} timezone={c.config.timezone} billingAvailable={!!c.stripe_customer_id} contactEmail={env.contactEmail} />;
}
