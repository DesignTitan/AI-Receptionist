import { AuthFlow, type Screen } from "@/components/account-auth/auth-flow";
import { env } from "@/lib/env";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in · AI Receptionist",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const query = await searchParams;
  const allowed = [
    "signin",
    "email",
    "verify",
    "enroll",
    "recovery",
    "settings",
    "passkey",
    "authenticator",
    "codes",
    "pending",
    "expired",
    "devices",
  ];
  const preview =
    process.env.NODE_ENV === "development" &&
    allowed.includes(query.preview ?? "");
  return (
    <AuthFlow
      initial={preview ? (query.preview as Screen) : "signin"}
      preview={preview}
      siteKey={env.turnstile.siteKey ?? ""}
      passkeysEnabled={process.env.AUTH_PASSKEYS_ENABLED === "true"}
    />
  );
}
