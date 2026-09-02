-- ============================================================================
-- AI Receptionist — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`), then run seed.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Providers ────────────────────────────────────────────────────────────────
create table if not exists public.providers (
  id                uuid primary key default gen_random_uuid(),
  -- Which themed business this row belongs to (medical, salon, …).
  vertical          text not null default 'medical',
  slug              text not null,
  name              text not null,
  credentials       text not null default '',
  specialty         text not null,
  bio               text not null default '',
  photo_url         text not null default '',
  years_experience  int  not null default 0,
  rating            numeric(2,1) not null default 5.0,
  reviews_count     int  not null default 0,
  languages         text[] not null default '{English}',
  education         text not null default '',
  consultation_fee  numeric(10,2) not null default 0,
  location          text not null default '',
  -- 0 = Sunday … 6 = Saturday
  working_days      int[] not null default '{1,2,3,4,5}',
  start_time        text not null default '09:00',
  end_time          text not null default '17:00',
  slot_minutes      int  not null default 30,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  unique (vertical, slug)
);

-- ── Clients ───────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  -- Normalised to digits + leading '+' by the app, so it can act as the identity key.
  phone       text not null unique,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── Appointments ───────────────────────────────────────────────────────────
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  -- Denormalised from the provider so the shared dashboard can filter without a join.
  vertical        text not null default 'medical',
  reference       text not null unique,
  provider_id       uuid not null references public.providers(id) on delete restrict,
  client_id      uuid not null references public.clients(id) on delete cascade,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  reason          text,
  status          text not null default 'pending'
                  check (status in ('pending','confirmed','rescheduled','cancelled','completed','no_answer')),
  is_new_client  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists appointments_provider_time_idx on public.appointments (provider_id, starts_at);
create index if not exists appointments_status_idx      on public.appointments (status);
create index if not exists appointments_created_idx     on public.appointments (created_at desc);

-- Stops two clients holding the same slot with the same provider.
create unique index if not exists appointments_no_double_booking_idx
  on public.appointments (provider_id, starts_at)
  where status <> 'cancelled';

-- ── Call logs ──────────────────────────────────────────────────────────────
create table if not exists public.call_logs (
  id                uuid primary key default gen_random_uuid(),
  appointment_id    uuid not null references public.appointments(id) on delete cascade,
  client_id        uuid not null references public.clients(id) on delete cascade,
  provider          text not null default 'demo',
  provider_call_id  text,
  direction         text not null default 'outbound' check (direction in ('outbound','inbound')),
  status            text not null default 'queued'
                    check (status in ('queued','ringing','in_progress','completed','failed')),
  outcome           text check (outcome in ('confirmed','rescheduled','cancelled','voicemail','no_answer','failed')),
  recording_url     text,
  transcript        text,
  summary           text,
  duration_seconds  int,
  cost              numeric(10,4),
  error             text,
  started_at        timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists call_logs_appointment_idx on public.call_logs (appointment_id, created_at desc);
create unique index if not exists call_logs_provider_call_idx
  on public.call_logs (provider_call_id) where provider_call_id is not null;

-- ── Notification logs ──────────────────────────────────────────────────────
create table if not exists public.notification_logs (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references public.appointments(id) on delete set null,
  channel         text not null default 'email',
  recipient       text not null,
  subject         text not null,
  status          text not null default 'sent' check (status in ('sent','failed','logged')),
  error           text,
  created_at      timestamptz not null default now()
);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists appointments_touch_updated_at on public.appointments;
create trigger appointments_touch_updated_at
  before update on public.appointments
  for each row execute function public.touch_updated_at();

-- ── Row level security ─────────────────────────────────────────────────────
-- Every write in this app runs through server code holding the service role
-- key, which bypasses RLS. The only thing the anon key may see is the public
-- provider roster; client records, appointments and recordings are never
-- readable from the browser.
alter table public.providers           enable row level security;
alter table public.clients          enable row level security;
alter table public.appointments      enable row level security;
alter table public.call_logs         enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "public can read active providers" on public.providers;
create policy "public can read active providers"
  on public.providers for select
  to anon, authenticated
  using (is_active = true);

-- No anon/authenticated policies exist for the remaining tables, so all access
-- to them is denied unless it comes from the service role.

-- ── Realtime (optional) ────────────────────────────────────────────────────
-- Lets the admin dashboard subscribe to live changes instead of polling.
-- Safe to skip; the dashboard falls back to polling either way.
do $$
begin
  execute 'alter publication supabase_realtime add table public.appointments';
exception when others then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.call_logs';
exception when others then null;
end $$;
