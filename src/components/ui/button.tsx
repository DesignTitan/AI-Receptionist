import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-line bg-surface text-ink hover:border-line-strong",
  ink: "bg-ink text-bg hover:opacity-90",
};
const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-12 px-6 text-[15px]",
};

/**
 * The pill button used across the product and every demo. A hash `href`
 * renders a plain anchor (same-page scroll), any other `href` a Next link,
 * and no `href` a <button>. The hero-sized primary carries the card shadow.
 */
export function Button({
  variant = "primary",
  size = "lg",
  href,
  className = "",
  children,
  type = "button",
}: {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
}) {
  const shadow = variant === "primary" && size === "lg" ? " shadow-[var(--shadow-md)]" : "";
  const cls = `inline-flex items-center gap-2 rounded-full font-semibold transition ${SIZE[size]} ${VARIANT[variant]}${shadow} ${className}`.trim();
  if (href?.startsWith("#") || href?.startsWith("mailto:")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls}>
      {children}
    </button>
  );
}
