import {
  DESTINATION_COOKIE,
  emailProvider,
  limit,
  cookieOptions,
  AuthError,
} from "@/lib/account-auth/server";
import { cookies } from "next/headers";
import { planReturnUrl } from "@/lib/platform/plan-navigation";
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/platform/server";
import { email, planOf, text } from "@/lib/platform/model";
import { env } from "@/lib/env";
import { verifyHuman } from "@/lib/turnstile";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = await request.json();
    const address = email(body.email);
    const plan = body.plan === undefined ? null : planOf(body.plan);
    const name = plan ? text(body.name, "name") : undefined;
    const human = await verifyHuman(
      body.token,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    );
    if (!human.ok)
      return NextResponse.json(
        { error: "Complete the human check and try again." },
        { status: 403 },
      );
    await limit(`email:${address}`, 5);
    const destination = plan
      ? `/start?plan=${plan}&review=1&returnTo=${encodeURIComponent(planReturnUrl(typeof body.returnTo === "string" ? body.returnTo : undefined, plan))}`
      : "/account";
    (await cookies()).set(DESTINATION_COOKIE, destination, {
      ...cookieOptions,
      maxAge: 600,
    });
    const { error } = await (
      await emailProvider()
    ).auth.signInWithOtp({
      email: address,
      options: {
        shouldCreateUser: !!plan,
        emailRedirectTo: `${env.siteUrl}/account/callback${plan ? `?plan=${plan}&returnTo=${encodeURIComponent(planReturnUrl(typeof body.returnTo === "string" ? body.returnTo : undefined, plan))}` : ""}`,
        ...(name ? { data: { full_name: name } } : {}),
      },
    });
    if (
      error &&
      error.code !== "otp_disabled" &&
      error.code !== "user_not_found"
    )
      return NextResponse.json(
        {
          error:
            "We could not send a sign-in link. Please wait a minute and try again.",
        },
        { status: 429 },
      );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    return NextResponse.json(
      { error: "Check your email address and try again." },
      { status: 400 },
    );
  }
}
