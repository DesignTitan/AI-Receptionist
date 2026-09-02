"use client";

import Image from "next/image";
import { useState } from "react";

const PALETTES = [
  "from-teal-500/25 to-emerald-500/10",
  "from-indigo-500/25 to-sky-500/10",
  "from-amber-500/25 to-rose-500/10",
  "from-cyan-500/25 to-blue-500/10",
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
  src,
  sizes,
  className = "",
  priority = false,
}: {
  name: string;
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
      alt={`Portrait of Dr. ${name}`}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
