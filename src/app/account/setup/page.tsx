import { BusinessSetupForm } from "@/components/platform/business-setup-form";
import { ownedCustomer } from "@/lib/platform/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Setup({searchParams}:{searchParams:Promise<{preview?:string;step?:string}>}) {
  if(process.env.NODE_ENV === "development") {
    const query=await searchParams;
    if(query.preview==="setup")return <BusinessSetupForm customer={null} plan="busy" preview initialStep={query.step==="3"?3:query.step==="2"?2:1}/>;
  }
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  if (c.status !== "paid" || c.billing_status !== "active") redirect("/account");
  return <BusinessSetupForm customer={c} plan={c.plan} />;
}
