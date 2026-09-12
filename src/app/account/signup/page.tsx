import { redirect } from "next/navigation";
import { AuthFlow } from "@/components/account-auth/auth-flow";
import { env } from "@/lib/env";
import { planOf } from "@/lib/platform/model";
import { planReturnUrl } from "@/lib/platform/plan-navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign up · AI Receptionist", robots: { index: false, follow: false } };

export default async function Signup({ searchParams }: {
  searchParams: Promise<{ plan?: string; returnTo?: string; preview?: string }>;
}) {
  const query = await searchParams;
  let plan;
  try { plan = planOf(query.plan); } catch { redirect("/#terms"); }
  const returnTo = planReturnUrl(query.returnTo, plan);
  return <AuthFlow signup={{ plan, returnTo }} siteKey={env.turnstile.siteKey ?? ""}
    preview={process.env.NODE_ENV === "development" && query.preview === "signup"} />;
}
