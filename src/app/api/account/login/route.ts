import { NextResponse } from "next/server";
import { authClient, checkOrigin } from "@/lib/platform/server";
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
    const { error } = await authClient().auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: `${env.siteUrl}/account/callback${plan ? `?plan=${plan}` : ""}`,
        ...(name ? { data: { full_name: name } } : {}),
      },
    });
    if (error)
      return NextResponse.json(
        {
          error:
            "We could not send a sign-in link. Please wait a minute and try again.",
        },
        { status: 429 },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Check your email address and try again." },
      { status: 400 },
    );
  }
}
