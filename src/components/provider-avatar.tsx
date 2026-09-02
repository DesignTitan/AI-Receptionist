"use client";

import Image from "next/image";
import { useState } from "react";

/** Token-based so the monogram follows whichever vertical is active. */
const PALETTES = [
  "from-primary/25 to-primary/5",
  "from-accent/25 to-accent/5",
  "from-warning/25 to-danger/10",
  "from-info/25 to-primary/10",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Provider headshot with a graceful fallback: if the remote photo fails, the card
 * shows a tinted monogram instead of a broken image.
 */
export function ProviderAvatar({
  name,
  label,
  src,
  sizes,
  className = "",
  priority = false,
}: {
  name: string;
  /** How the person is addressed ("Dr. Elena Vasquez"); `name` alone feeds the monogram. */
  label?: string;
  src: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);
  const palette =
    PALETTES[name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % PALETTES.length];

  if (failed) {
    return (
      <div
        className={`absolute inset-0 grid place-items-center bg-gradient-to-br ${palette} ${className}`}
        aria-hidden
      >
        <span className="font-display text-3xl text-ink/70">{initials(name)}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Portrait of ${label ?? name}`}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
