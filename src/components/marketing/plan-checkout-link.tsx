"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Plan } from "@/lib/platform/pricing";
import { planReturnUrl } from "@/lib/platform/plan-navigation";

export function PlanCheckoutLink({ plan, className, children }: { plan: Plan; className?: string; children: ReactNode }) {
  const [source, setSource] = useState("/");
  useEffect(() => { setSource(location.pathname + location.search); }, []);
  const returnTo = planReturnUrl(source, plan);
  return <a className={className} href={`/start?plan=${plan}&returnTo=${encodeURIComponent(returnTo)}`}>{children}</a>;
}
