import Link from "next/link";
import { PhoneRinging } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export const PRODUCT_NAME = "bubs";

export function ProductLogo() {
  return (
    <Link href="/" className="group flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary shadow-sm transition group-hover:scale-105">
        <PhoneRinging width={19} height={19} strokeWidth={2} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-semibold tracking-tight text-ink">
          {PRODUCT_NAME}
        </span>
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-subtle sm:block">
          Your AI receptionist. Your day back.
        </span>
      </span>
    </Link>
  );
}

const NAV = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Industries", href: "/#industries" },
  { label: "Demos", href: "/demos" },
  { label: "Pricing", href: "/#terms" },
];

export function ProductHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line surface-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <ProductLogo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} className="transition hover:text-ink" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/features" className="p-2 text-sm text-ink md:hidden">Features</Link>
          <span className="hidden lg:inline-flex"><ThemeToggle /></span>
          <Button href="/demos" size="sm" className="whitespace-nowrap">
            Try a demo
          </Button>
        </div>
      </div>
    </header>
  );
}

export function ProductFooter() {
  const contact = env.contactEmail;
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <ProductLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Online booking, AI confirmation calls and a clear view of what needs your attention.
              Built for businesses that run on appointments.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Product
              </h3>
              <ul className="space-y-2 text-muted">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link className="transition hover:text-ink" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Operators
              </h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link className="transition hover:text-ink" href="/account">
                    Owner dashboard
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-ink" href="/demos">
                    Live demos
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Talk to us
              </h3>
              <p className="text-muted">
                {contact ? (
                  <a className="transition hover:text-ink" href={`mailto:${contact}`}>
                    {contact}
                  </a>
                ) : (
                  "Try the demos first — they're the real thing."
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME}.</p>
          <p>The three demo businesses are fictional. No real services are provided.</p>
        </div>
      </div>
    </footer>
  );
}
