begin;
create table if not exists public.billing_environment (
 singleton boolean primary key default true check(singleton),
 mode text not null check(mode in('test','live')),
 account_id text not null check(account_id ~ '^acct_[A-Za-z0-9]+$')
);
insert into public.billing_environment values(true,'test','acct_1UDNPDPicyLxgU34') on conflict do nothing;
alter table public.billing_environment enable row level security;
revoke all on public.billing_environment from anon,authenticated;
grant select on public.billing_environment to service_role;
create or replace function public.set_stripe_environment(new_mode text,new_account text)
returns void language plpgsql security definer set search_path=public as $$
declare old billing_environment;
begin
 select * into old from billing_environment where singleton for update;
 if new_mode not in('test','live') or new_account !~ '^acct_[A-Za-z0-9]+$' then raise exception 'Invalid Stripe environment';end if;
 if old.mode=new_mode and old.account_id=new_account then return;end if;
 if exists(select 1 from customers where status<>'draft' or billing_status is not null or stripe_customer_id is not null or stripe_subscription_id is not null or checkout_attempt is not null or checkout_session_id is not null or setup_price_id is not null or setup_fee_cents is not null or setup_paid_at is not null)
 or exists(select 1 from stripe_events) or exists(select 1 from usage_periods) or exists(select 1 from call_usage)
 or exists(select 1 from pilot_setup_slots where redeemed or customer_id is not null) then
  raise exception 'Financial history exists. Keep this database for its existing Stripe environment and use a clean database for the new environment.';
 end if;
 update billing_environment set mode=new_mode,account_id=new_account where singleton;
end $$;
create or replace function public.assert_stripe_environment(expected_mode text,expected_account text)
returns void language plpgsql security definer set search_path=public as $$
declare current billing_environment;
begin
 select * into current from billing_environment where singleton for share;
 if current.mode is distinct from expected_mode or current.account_id is distinct from expected_account then raise exception 'Stripe environment mismatch';end if;
end $$;
create or replace function public.claim_environment_checkout(c_id uuid,user_id uuid,pilot_price text,standard_price text,expected_mode text,expected_account text)
returns public.customers language plpgsql security definer set search_path=public as $$
begin
 perform assert_stripe_environment(expected_mode,expected_account);
 return claim_pilot_checkout(c_id,user_id,pilot_price,standard_price);
end $$;
create or replace function public.apply_environment_subscription(event_id text,c_id uuid,subscription text,stripe_customer text,new_plan text,subscription_status text,p_start timestamptz,p_end timestamptz,paid_setup boolean,expected_mode text,expected_account text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 perform assert_stripe_environment(expected_mode,expected_account);
 return apply_pilot_subscription(event_id,c_id,subscription,stripe_customer,new_plan,subscription_status,p_start,p_end,paid_setup);
end $$;
revoke all on function set_stripe_environment(text,text),assert_stripe_environment(text,text),claim_environment_checkout(uuid,uuid,text,text,text,text),apply_environment_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz,boolean,text,text) from public,anon,authenticated;
grant execute on function set_stripe_environment(text,text),assert_stripe_environment(text,text),claim_environment_checkout(uuid,uuid,text,text,text,text),apply_environment_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz,boolean,text,text) to service_role;
commit;
