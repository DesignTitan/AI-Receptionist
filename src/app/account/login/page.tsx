import { Frame } from "@/components/platform/frame";
import { LoginForm } from "@/components/platform/login-form";
import { env } from "@/lib/env";
export const dynamic = "force-dynamic";
export default function Login() {
  return (
    <Frame
      eyebrow="Your business, your space"
      title="Welcome to your front desk."
      description="Sign in to set up your business, check bookings, and keep an eye on every call."
    >
      <div style={{ maxWidth: 520 }}>
        <LoginForm siteKey={env.turnstile.siteKey ?? ""} />
      </div>
    </Frame>
  );
}
