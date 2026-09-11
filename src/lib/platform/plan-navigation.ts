import type { Plan } from "./pricing.ts";

export function planReturnUrl(source: string | undefined, plan: Plan): string {
  const fallback = `/#plan-card-${plan}`;
  if (!source || !source.startsWith("/") || source.startsWith("//") || source.includes("\\")) return fallback;
  try {
    const url = new URL(source, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || !["/", "/pricing"].includes(url.pathname)) return fallback;
    return `${url.pathname}${url.search}#plan-card-${plan}`;
  } catch { return fallback; }
}
