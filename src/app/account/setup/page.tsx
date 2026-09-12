import { BusinessSetupForm } from "@/components/platform/business-setup-form";
import { ownedCustomer } from "@/lib/platform/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Setup({searchParams}:{searchParams:Promise<{preview?:string;step?:string}>}) {
  if(process.env.NODE_ENV === "development") {
    const query=await searchParams;
    if(query.preview==="setup")redirect(`/account?preview=confirmation#${query.step==="3"?"review-setup":query.step==="2"?"hours-team":"business-details"}`);
  }
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  if (c.status !== "paid" || c.billing_status !== "active") redirect("/account");
  if(c.config.setupPending)redirect("/account#business-details");
  return <BusinessSetupForm customer={c} plan={c.plan} />;
}
