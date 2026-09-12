import { AuthFlow } from "@/components/account-auth/auth-flow";
import { env } from "@/lib/env";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign-in & security · AI Receptionist",
  robots: { index: false, follow: false },
};
export default function Security() {
  return (
    <AuthFlow
      initial="settings"
      siteKey={env.turnstile.siteKey ?? ""}
      passkeysEnabled={process.env.AUTH_PASSKEYS_ENABLED === "true"}
    />
  );
}
