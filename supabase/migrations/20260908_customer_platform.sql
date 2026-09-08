begin;
-- Additive launch migration. Existing demo tables remain untouched.
create extension if not exists btree_gist;
create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete restrict,
 owner_email text not null, business_name text not null, slug text not null unique,
 plan text not null check (plan in ('front','busy','full')),
 status text not null default 'draft' check (status in ('draft','paid','provisioning','live','paused')),
 config jsonb not null, stripe_customer_id text unique, stripe_subscription_id text unique,
 billing_status text, agent_id text, number_id text, phone_number text, provision_error text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_bookings (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete restrict,
 provider_id text not null, full_name text not null, phone text not null, email text,
 starts_at timestamptz not null, ends_at timestamptz not null, reference text not null unique default (replace(gen_random_uuid()::text,'-','') || substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 status text not null default 'pending' check (status in ('pending','confirmed','cancelled','rescheduled')),
 call_status text not null default 'queued' check (call_status in ('queued','dispatching','ringing','completed','failed')),
 provider_call_id text, outcome text, summary text, transcript text, recording_url text,
 duration_seconds integer check (duration_seconds >= 0), created_at timestamptz not null default now(),
 check (ends_at > starts_at),
 exclude using gist (customer_id with =, provider_id with =, tstzrange(starts_at, ends_at, '[)') with &&) where (status <> 'cancelled')
);
create index if not exists customer_bookings_customer_time on public.customer_bookings(customer_id, created_at);
create unique index if not exists customer_bookings_call_id on public.customer_bookings(provider_call_id) where provider_call_id is not null;
create table if not exists public.customer_jobs (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
 booking_id uuid references public.customer_bookings(id) on delete cascade,
 kind text not null check(kind in ('booking_email','call','call_email','welcome','live','signup_alert')),
 dedupe_key text not null unique, state text not null default 'queued' check(state in ('queued','working','sent','failed')),
 attempts integer not null default 0, error text, locked_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.stripe_events (
 id text primary key, created_at timestamptz not null default now()
);
alter table public.customers enable row level security;
alter table public.customer_bookings enable row level security;
alter table public.customer_jobs enable row level security;
alter table public.stripe_events enable row level security;
-- No browser policies: all data access requires server authentication + explicit customer scope.
revoke all on public.customers, public.customer_bookings, public.customer_jobs, public.stripe_events from anon, authenticated;
grant all on public.customers, public.customer_bookings, public.customer_jobs, public.stripe_events to service_role;

create or replace function public.reserve_customer_booking(c_id uuid, member text, guest text, telephone text, guest_email text, begins timestamptz, finishes timestamptz)
returns public.customer_bookings language plpgsql security definer set search_path = public as $$
declare c customers; b customer_bookings;
begin
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status <> 'live' or c.billing_status is distinct from 'active' then raise exception 'Business is not taking bookings'; end if;
 if begins < now() + interval '90 minutes' or begins > now() + interval '31 days' then raise exception 'Booking time unavailable'; end if;
 if (select count(*) from customer_bookings where customer_id=c_id and phone=telephone and created_at > now()-interval '24 hours') >= 3 then raise exception 'Daily booking limit reached'; end if;
 if (select count(*) from customer_bookings where customer_id=c_id and created_at > now()-interval '24 hours') >= 100 then raise exception 'Daily booking limit reached'; end if;
 insert into customer_bookings(customer_id,provider_id,full_name,phone,email,starts_at,ends_at)
 values(c_id,member,guest,telephone,guest_email,begins,finishes) returning * into b;
 insert into customer_jobs(customer_id,booking_id,kind,dedupe_key) values(c_id,b.id,'booking_email','booking-email:'||b.id),(c_id,b.id,'call','call:'||b.id);
 return b;
end $$;
revoke all on function public.reserve_customer_booking(uuid,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.reserve_customer_booking(uuid,text,text,text,text,timestamptz,timestamptz) to service_role;

-- Event application and receipt are one transaction. Duplicate delivery cannot send duplicate welcome emails.
create or replace function public.apply_customer_subscription(event_id text, c_id uuid, subscription text, stripe_customer text, new_plan text, subscription_status text)
returns boolean language plpgsql security definer set search_path=public as $$
declare old customers;
begin
 select * into old from customers where id=c_id for update;
 if old.id is null then raise exception 'Unknown customer'; end if;
 if exists(select 1 from stripe_events where id=event_id) then return false; end if;
 if old.stripe_subscription_id is not null and old.stripe_subscription_id <> subscription then raise exception 'Different subscription already linked'; end if;
 update customers set stripe_subscription_id=subscription,stripe_customer_id=stripe_customer,plan=new_plan,billing_status=subscription_status,
 status=case when subscription_status='active' and old.status='draft' then 'paid' when subscription_status<>'active' and old.status<>'draft' then 'paused' else old.status end,
 updated_at=now() where id=c_id;
 if old.status='draft' and subscription_status='active' then
 insert into customer_jobs(customer_id,kind,dedupe_key) values(c_id,'welcome','welcome:'||c_id),(c_id,'signup_alert','signup-alert:'||c_id) on conflict(dedupe_key) do nothing;
 end if;
 insert into stripe_events(id) values(event_id);
 return true;
end $$;
revoke all on function public.apply_customer_subscription(text,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.apply_customer_subscription(text,uuid,text,text,text,text) to service_role;

create or replace function public.claim_customer_jobs(batch_size integer default 10)
returns setof public.customer_jobs language sql security definer set search_path=public as $$
 update customer_jobs set state='working',locked_at=now(),attempts=attempts+1
 where id in(select id from customer_jobs where state='queued' order by created_at for update skip locked limit least(batch_size,20)) returning *;
$$;
revoke all on function public.claim_customer_jobs(integer) from public,anon,authenticated;
grant execute on function public.claim_customer_jobs(integer) to service_role;

-- Persist a checkout attempt before contacting Stripe. Retries share one immutable request.
alter table public.customers add column if not exists checkout_attempt uuid;
alter table public.customers add column if not exists checkout_expires bigint;
alter table public.customers add column if not exists checkout_session_id text;
create or replace function public.claim_customer_checkout(c_id uuid, user_id uuid)
returns public.customers language plpgsql security definer set search_path=public as $$
declare c customers;
begin
 select * into c from customers where id=c_id and owner_id=user_id for update;
 if c.id is null or c.status<>'draft' or c.stripe_subscription_id is not null then raise exception 'Checkout unavailable'; end if;
 if c.checkout_attempt is null then
 update customers set checkout_attempt=gen_random_uuid(),checkout_expires=extract(epoch from now())::bigint+3600 where id=c_id returning * into c;
 end if;
 return c;
end $$;
revoke all on function public.claim_customer_checkout(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_customer_checkout(uuid,uuid) to service_role;

create unique index if not exists customers_agent_unique on public.customers(agent_id) where agent_id is not null;
create unique index if not exists customers_number_unique on public.customers(number_id) where number_id is not null;
alter table public.customer_bookings add column if not exists call_completed_at timestamptz;

create or replace function public.activate_customer(c_id uuid, target_status text, agent text, number text, telephone text)
returns void language plpgsql security definer set search_path=public as $$
declare c customers;
begin
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status='draft' then raise exception 'Customer is not paid'; end if;
 if target_status not in ('provisioning','live','paused') then raise exception 'Invalid status'; end if;
 if target_status='live' and (c.billing_status is distinct from 'active' or agent is null or number is null or telephone is null) then raise exception 'Active billing and voice line required'; end if;
 update customers set status=target_status,agent_id=agent,number_id=number,phone_number=telephone,provision_error=null,updated_at=now() where id=c_id;
 if target_status='live' then
 insert into customer_jobs(customer_id,kind,dedupe_key) values(c_id,'live','live:'||c_id) on conflict(dedupe_key) do nothing;
 end if;
end $$;
revoke all on function public.activate_customer(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.activate_customer(uuid,text,text,text,text) to service_role;

create or replace function public.record_customer_call(c_id uuid, b_id uuid, result text, call_summary text, call_transcript text, recording text, seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare b customer_bookings;
begin
 select * into b from customer_bookings where id=b_id and customer_id=c_id for update;
 if b.id is null then return false; end if;
 if b.call_completed_at is not null then return true; end if;
 update customer_bookings set call_status=case when result='failed' then 'failed' else 'completed' end,
 outcome=result,summary=call_summary,transcript=call_transcript,recording_url=recording,duration_seconds=seconds,call_completed_at=now(),
 status=case when b.status='cancelled' then 'cancelled' when result in ('confirmed','rescheduled','cancelled') then result else b.status end
 where id=b_id;
 insert into customer_jobs(customer_id,booking_id,kind,dedupe_key) values(c_id,b_id,'call_email','call-email:'||b_id) on conflict(dedupe_key) do nothing;
 return true;
end $$;
revoke all on function public.record_customer_call(uuid,uuid,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.record_customer_call(uuid,uuid,text,text,text,text,integer) to service_role;
commit;
