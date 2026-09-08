begin;
alter table public.customers add column if not exists setup_fee_cents integer check(setup_fee_cents in(29900,49900,100000));
alter table public.customers add column if not exists setup_price_id text;
alter table public.customers add column if not exists setup_paid_at timestamptz;
-- Honor previously issued checkouts. New draft customers receive the current offer.
update public.customers set setup_fee_cents=100000 where setup_fee_cents is null and (checkout_attempt is not null or stripe_subscription_id is not null);
create table if not exists public.pilot_setup_slots (
 slot integer primary key check(slot between 1 and 10),
 customer_id uuid unique references public.customers(id) on delete set null,
 redeemed boolean not null default false
);
insert into public.pilot_setup_slots(slot) select generate_series(1,10) on conflict do nothing;
alter table public.pilot_setup_slots enable row level security;
revoke all on public.pilot_setup_slots from anon,authenticated;
grant all on public.pilot_setup_slots to service_role;
create or replace function public.claim_pilot_checkout(c_id uuid,user_id uuid,pilot_price text,standard_price text)
returns public.customers language plpgsql security definer set search_path=public as $$
declare c customers;s integer;
begin
 -- A single lock serializes allocation and release, including across different customers.
 perform pg_advisory_xact_lock(29949910);
 select * into c from customers where id=c_id and owner_id=user_id for update;
 if c.id is null or c.status<>'draft' or c.stripe_subscription_id is not null then raise exception 'Checkout unavailable';end if;
 if c.checkout_attempt is not null then return c;end if;
 if coalesce(pilot_price,'')='' or coalesce(standard_price,'')='' then raise exception 'Setup prices unavailable';end if;
 select slot into s from pilot_setup_slots where customer_id is null and not redeemed order by slot limit 1 for update;
 if s is not null then update pilot_setup_slots set customer_id=c_id where slot=s;end if;
 update customers set checkout_attempt=gen_random_uuid(),checkout_expires=extract(epoch from now())::bigint+3600,
 setup_fee_cents=case when s is null then 49900 else 29900 end,
 setup_price_id=case when s is null then standard_price else pilot_price end
 where id=c_id returning * into c;
 return c;
end $$;
-- Caller must verify this exact Stripe session is expired and unpaid before invoking.
create or replace function public.release_pilot_checkout(c_id uuid,attempt uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare c customers;
begin
 perform pg_advisory_xact_lock(29949910);
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status<>'draft' or c.stripe_subscription_id is not null or c.setup_paid_at is not null or c.checkout_attempt is distinct from attempt then return false;end if;
 update pilot_setup_slots set customer_id=null where customer_id=c_id and not redeemed;
 update customers set checkout_attempt=null,checkout_expires=null,checkout_session_id=null,setup_fee_cents=null,setup_price_id=null where id=c_id;
 return true;
end $$;
-- First-invoice verification occurs in the signed webhook. Receipt, status and redemption are atomic.
create or replace function public.apply_pilot_subscription(event_id text,c_id uuid,subscription text,stripe_customer text,new_plan text,subscription_status text,p_start timestamptz,p_end timestamptz,paid_setup boolean)
returns boolean language plpgsql security definer set search_path=public as $$
declare c customers;applied boolean;
begin
 perform pg_advisory_xact_lock(29949910);
 select * into c from customers where id=c_id for update;
 if c.id is null then raise exception 'Unknown customer';end if;
 if subscription_status='active' and c.setup_paid_at is null and not paid_setup then raise exception 'Setup payment must be verified';end if;
 applied:=apply_billed_subscription(event_id,c_id,subscription,stripe_customer,new_plan,subscription_status,p_start,p_end);
 if applied and subscription_status='active' and c.setup_paid_at is null then
  if c.setup_fee_cents=29900 then
   update pilot_setup_slots set redeemed=true where customer_id=c_id;
   if not found then raise exception 'Pilot reservation missing';end if;
  end if;
  update customers set setup_paid_at=now() where id=c_id;
 end if;
 return applied;
end $$;
revoke all on function claim_pilot_checkout(uuid,uuid,text,text),release_pilot_checkout(uuid,uuid),apply_pilot_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz,boolean) from public,anon,authenticated;
grant execute on function claim_pilot_checkout(uuid,uuid,text,text),release_pilot_checkout(uuid,uuid),apply_pilot_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz,boolean) to service_role;
commit;
