begin;
-- Retain historical amounts for completed and already-issued purchases.
alter table public.customers drop constraint if exists customers_setup_fee_cents_check;
alter table public.customers add constraint customers_setup_fee_cents_check
 check (setup_fee_cents in (8900,29900,49900,100000));
create or replace function public.claim_flat_checkout(c_id uuid,user_id uuid,setup_price text,expected_mode text,expected_account text)
returns public.customers language plpgsql security definer set search_path=public as $$
declare c customers;
begin
 perform assert_stripe_environment(expected_mode,expected_account);
 perform pg_advisory_xact_lock(29949910);
 select * into c from customers where id=c_id and owner_id=user_id for update;
 if c.id is null or c.status<>'draft' or c.stripe_subscription_id is not null then raise exception 'Checkout unavailable';end if;
 if c.checkout_attempt is not null then return c;end if;
 if coalesce(setup_price,'')='' then raise exception 'Setup price unavailable';end if;
 update customers set checkout_attempt=gen_random_uuid(),checkout_expires=extract(epoch from now())::bigint+3600,
 setup_fee_cents=case when plan='full' then 49900 else 8900 end,setup_price_id=setup_price
 where id=c_id returning * into c;
 return c;
end $$;
revoke all on function public.claim_flat_checkout(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.claim_flat_checkout(uuid,uuid,text,text,text) to service_role;
commit;
