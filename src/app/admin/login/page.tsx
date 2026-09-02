import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/admin/actions";
import { AlertTriangle, Lock, PulseMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { usingDefaultPassword } from "@/lib/auth";
import { DEFAULT_VERTICAL as v } from "@/verticals";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="relative grid min-h-dvh place-items-center px-5 py-12">
      <div className="aurora absolute inset-0 -z-10" />
      <div className="grid-backdrop absolute inset-0 -z-10" />

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-on-primary">
            <PulseMark width={24} height={24} strokeWidth={2} />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink">
            Staff dashboard
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted">{v.brand}</p>
        </div>

        <form action={login} className="card space-y-4 p-6">
          <input type="hidden" name="next" value={next ?? "/admin"} />

          <label className="block">
            <span className="mb-1.5 block text-[13.5px] font-medium text-ink">Password</span>
            <div className="relative">
              <Lock
                width={17}
                height={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-[14.5px] text-ink placeholder:text-subtle transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--primary-ring)]"
              />
            </div>
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
              <AlertTriangle width={16} height={16} className="shrink-0" />
              That password isn&apos;t right.
            </p>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            Sign in
          </button>

          {usingDefaultPassword() && (
            <p className="rounded-lg bg-warning-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-warning">
              Demo mode: the password is <code className="font-semibold">demo1234</code>. Set{" "}
              <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> before deploying.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-[13px] text-subtle">
          <Link href="/" className="transition hover:text-ink">
            ← Back to the booking site
          </Link>
        </p>
      </div>
    </div>
  );
}
