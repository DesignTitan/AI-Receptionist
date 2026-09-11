import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authClient, checkOrigin, OWNER_COOKIE } from "@/lib/platform/server";
import { email } from "@/lib/platform/model";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = await request.json();
    const address = email(body.email);
    if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code))
      return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 });
    // Supabase validates expiry, single use and rate limits; the browser cannot
    // create an authenticated session just by advancing the signup screen.
    const { data, error } = await authClient().auth.verifyOtp({ email: address, token: body.code, type: "email" });
    if (error || !data.session || !data.user?.email_confirmed_at || data.user.email?.toLowerCase() !== address)
      return NextResponse.json({ error: "That code is incorrect or expired. Try again or request a new code." }, { status: error?.status === 429 ? 429 : 401 });
    (await cookies()).set(OWNER_COOKIE, data.session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
      maxAge: Math.min(data.session.expires_in, 3600),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn’t verify your email. Please try again." }, { status: 400 });
  }
}
