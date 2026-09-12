import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/platform/server";
import {
  PKCE_COOKIE,
  DESTINATION_COOKIE,
  emailProvider,
  startSession,
  revokeCurrent,
  AuthError,
} from "@/lib/account-auth/server";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { code } = await request.json();
    if (
      typeof code !== "string" ||
      code.length > 2048 ||
      !(await cookies()).get(PKCE_COOKIE)
    )
      throw new AuthError(
        "Open the newest sign-in link in the browser where you requested it.",
        401,
      );
    const { data, error } = await (
      await emailProvider()
    ).auth.exchangeCodeForSession(code);
    if (error || !data.session)
      throw new AuthError(
        "This sign-in link has expired. Please request another.",
        401,
      );
    const jar = await cookies(),
      destination = jar.get(DESTINATION_COOKIE)?.value;
    await startSession(data.session.access_token, request, destination);
    jar.delete(DESTINATION_COOKIE);
    return NextResponse.json(
      { ok: true, url: "/account/security" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof AuthError
            ? e.message
            : "This sign-in link has expired. Please request another.",
      },
      { status: e instanceof AuthError ? e.status : 401 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    await revokeCurrent();
    return NextResponse.json({ ok: true, url: "/account/login" });
  } catch {
    return NextResponse.json(
      { error: "Could not sign out. Please try again." },
      { status: 403 },
    );
  }
}
