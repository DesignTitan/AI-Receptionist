"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkSitePassword,
  createSiteToken,
  safeNext,
  SITE_COOKIE,
  SITE_TTL_SECONDS,
} from "@/lib/site-gate";

/** Unlocks the site and drops the visitor where they were headed. */
export async function unlock(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  if (!checkSitePassword(password)) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set(SITE_COOKIE, await createSiteToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SITE_TTL_SECONDS,
  });
  redirect(next);
}
