import { ownedCustomer } from "@/lib/platform/server";
import { redirect } from "next/navigation";
import { BrandIntakeForm } from "@/components/platform/brand-intake-form";

export const dynamic = "force-dynamic";

export default async function BrandPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const query = await searchParams;
  // Allow a dev preview shell if needed later; we keep owner auth for now
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  return <BrandIntakeForm customer={c} preview={query.preview === "1"} />;
}

