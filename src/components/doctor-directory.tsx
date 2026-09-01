"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Doctor } from "@/lib/types";
import { DoctorAvatar } from "./doctor-avatar";
import { ArrowRight, Clock, Globe, MapPin, Star } from "./icons";

function DoctorCard({ doctor, priority }: { doctor: Doctor; priority: boolean }) {
  return (
    <article className="group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
      <Link href={`/doctors/${doctor.slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-[5/4] overflow-hidden bg-surface-2">
          <DoctorAvatar
            name={doctor.name}
            src={doctor.photo_url}
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star width={12} height={12} className="text-amber-300" />
            {doctor.rating.toFixed(1)}
            <span className="font-normal text-white/70">({doctor.reviews_count})</span>
          </span>
          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm">
              Dr. {doctor.name}
            </h3>
            <p className="text-[12.5px] text-white/80">{doctor.credentials}</p>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-[11.5px] font-semibold text-primary">
          {doctor.specialty}
        </span>
        <p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted">{doctor.bio}</p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-[12.5px] text-muted">
          <div className="flex items-center gap-1.5">
            <Clock width={14} height={14} className="text-subtle" />
            <span>{doctor.years_experience} yrs experience</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe width={14} height={14} className="text-subtle" />
            <span className="truncate">{doctor.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin width={14} height={14} className="text-subtle" />
            <span className="truncate">{doctor.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink">${doctor.consultation_fee}</span>
            <span>consult</span>
          </div>
        </dl>

        <Link
          href={`/doctors/${doctor.slug}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-primary group-hover:text-on-primary"
        >
          Check availability
          <ArrowRight width={16} height={16} />
        </Link>
      </div>
    </article>
  );
}

export function DoctorDirectory({ doctors }: { doctors: Doctor[] }) {
  const specialties = useMemo(
    () => ["All specialties", ...Array.from(new Set(doctors.map((d) => d.specialty))).sort()],
    [doctors],
  );
  const [active, setActive] = useState(specialties[0]);

  const visible =
    active === specialties[0] ? doctors : doctors.filter((d) => d.specialty === active);

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
        {visible.map((doctor, index) => (
          <DoctorCard key={doctor.id} doctor={doctor} priority={index < 3} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-muted">
          No doctors in that specialty right now.
        </p>
      )}
    </div>
  );
}
