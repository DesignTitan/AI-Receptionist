"use client";

import Link from "next/link";
import { providerLabel } from "@/lib/format";
import { useMemo, useState } from "react";
import type { Provider } from "@/lib/types";
import { demoPaths } from "@/verticals/paths";
import type { Terms } from "@/verticals/terms";
import { ProviderAvatar } from "./provider-avatar";
import { ArrowRight, Clock, Globe, MapPin, Star } from "./icons";

function ProviderCard({
  provider,
  priority,
  terms: t,
}: {
  provider: Provider;
  priority: boolean;
  terms: Terms;
}) {
  const href = demoPaths(provider.vertical).book(provider.slug);
  return (
    <article className="group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
      <Link href={href} className="block focus-visible:outline-none">
        <div className="relative aspect-[5/4] overflow-hidden bg-surface-2">
          <ProviderAvatar
            name={provider.name}
            label={providerLabel(provider)}
            src={provider.photo_url}
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star width={12} height={12} className="text-amber-300" />
            {provider.rating.toFixed(1)}
            <span className="font-normal text-white/70">({provider.reviews_count})</span>
          </span>
          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm">
              {providerLabel(provider)}
            </h3>
            <p className="text-[12.5px] text-white/80">{provider.credentials}</p>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-[11.5px] font-semibold text-primary">
          {provider.specialty}
        </span>
        <p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted">{provider.bio}</p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-[12.5px] text-muted">
          <div className="flex items-center gap-1.5">
            <Clock width={14} height={14} className="text-subtle" />
            <span>{provider.years_experience} yrs experience</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe width={14} height={14} className="text-subtle" />
            <span className="truncate">{provider.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin width={14} height={14} className="text-subtle" />
            <span className="truncate">{provider.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink">${provider.consultation_fee}</span>
            <span>{t.feeShort}</span>
          </div>
        </dl>

        <Link
          href={href}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-primary group-hover:text-on-primary"
        >
          Check availability
          <ArrowRight width={16} height={16} />
        </Link>
      </div>
    </article>
  );
}

export function ProviderDirectory({
  providers,
  terms: t,
}: {
  providers: Provider[];
  terms: Terms;
}) {
  const specialties = useMemo(
    () => [t.allCategories, ...Array.from(new Set(providers.map((d) => d.specialty))).sort()],
    [providers, t.allCategories],
  );
  const [active, setActive] = useState(specialties[0]);

  const visible =
    active === specialties[0] ? providers : providers.filter((d) => d.specialty === active);

  return (
    <div>
      <div className="scroll-x -mx-5 mb-8 flex gap-2 px-5 pb-1">
        {specialties.map((specialty) => {
          const selected = specialty === active;
          return (
            <button
              key={specialty}
              type="button"
              onClick={() => setActive(specialty)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                selected
                  ? "border-primary bg-primary text-on-primary"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {specialty}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((provider, index) => (
          <ProviderCard key={provider.id} provider={provider} priority={index < 3} terms={t} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-muted">
          No {t.provider.many} in that {t.providerCategory.toLowerCase()} right now.
        </p>
      )}
    </div>
  );
}
