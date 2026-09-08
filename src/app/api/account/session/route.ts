import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authClient, checkOrigin, OWNER_COOKIE } from "@/lib/platform/server";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { access_token } = await request.json();
    if (typeof access_token !== "string" || access_token.length > 8192)
      throw Error("Invalid sign-in.");
    const { data, error } = await authClient().auth.getUser(access_token);
    if (error || !data.user?.email_confirmed_at)
      throw Error("This sign-in link has expired. Please request another.");
    (await cookies()).set(OWNER_COOKIE, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "This sign-in link has expired. Please request another." },
      { status: 401 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    (await cookies()).delete(OWNER_COOKIE);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
}
