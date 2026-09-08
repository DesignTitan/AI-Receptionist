-- Run only in the disposable local test database after all platform migrations.
-- This suite rolls back every fixture and environment change; it sends no Stripe requests.
begin;

create function pg_temp.expect_environment_error(statement text, expected text)
returns void language plpgsql as $$
begin
 begin
  execute statement;
 exception when others then
  if position(expected in sqlerrm) <> 1 then
   raise exception 'Unexpected error: %, expected prefix: %', sqlerrm, expected;
  end if;
  return;
 end;
 raise exception 'Expected operation to fail: %', statement;
end $$;

do $suite$
declare
 c uuid := gen_random_uuid();
 u uuid := gen_random_uuid();
 r customers;
 field record;
 p uuid;
 b uuid;
 starts timestamptz := date_trunc('hour', now());
 blocked text := 'Financial history exists.';
begin
 if exists(select 1 from customers)
 or exists(select 1 from stripe_events)
 or exists(select 1 from usage_periods)
 or exists(select 1 from call_usage)
 or exists(select 1 from pilot_setup_slots where customer_id is not null or redeemed) then
  raise exception 'Stripe environment suite requires an empty disposable customer database';
 end if;
 if (select count(*) from billing_environment) <> 1 then
  raise exception 'Exactly one billing environment must exist';
 end if;

 -- An unused database and customers with intake-only drafts may be rebound.
 perform set_stripe_environment('live', 'acct_EnvironmentLive');
 perform assert_stripe_environment('live', 'acct_EnvironmentLive');
 perform set_stripe_environment('test', 'acct_EnvironmentTest');
 perform assert_stripe_environment('test', 'acct_EnvironmentTest');
 insert into auth.users(id) values(u);
 insert into customers(id,owner_id,owner_email,business_name,slug,plan,config)
 values(c,u,'environment@example.test','Environment test','environment-'||c,'front','{}');
 perform set_stripe_environment('live', 'acct_EnvironmentLive');
 perform assert_stripe_environment('live', 'acct_EnvironmentLive');
 perform set_stripe_environment('test', 'acct_EnvironmentTest');

 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('production','acct_EnvironmentLive')$$,
  'Invalid Stripe environment');
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','cus_WrongObject')$$,
  'Invalid Stripe environment');
 perform pg_temp.expect_environment_error(
  $$select assert_stripe_environment('live','acct_EnvironmentTest')$$,
  'Stripe environment mismatch');
 perform pg_temp.expect_environment_error(
  $$select assert_stripe_environment('test','acct_OtherAccount')$$,
  'Stripe environment mismatch');

 -- Guard failures must precede reservation/payment mutations.
 perform pg_temp.expect_environment_error(format(
  'select claim_environment_checkout(%L,%L,%L,%L,%L,%L)',
  c,u,'price_pilot_fixture','price_standard_fixture','live','acct_EnvironmentTest'),
  'Stripe environment mismatch');
 perform pg_temp.expect_environment_error(format(
  'select claim_environment_checkout(%L,%L,%L,%L,%L,%L)',
  c,u,'price_pilot_fixture','price_standard_fixture','test','acct_OtherAccount'),
  'Stripe environment mismatch');
 perform pg_temp.expect_environment_error(format(
  'select apply_environment_subscription(%L,%L,%L,%L,%L,%L,%L,%L,true,%L,%L)',
  'evt_wrong_mode_fixture',c,'sub_environment_fixture','cus_environment_fixture',
  'front','active',starts,starts+interval '1 month','live','acct_EnvironmentTest'),
  'Stripe environment mismatch');
 perform pg_temp.expect_environment_error(format(
  'select apply_environment_subscription(%L,%L,%L,%L,%L,%L,%L,%L,true,%L,%L)',
  'evt_wrong_account_fixture',c,'sub_environment_fixture','cus_environment_fixture',
  'front','active',starts,starts+interval '1 month','test','acct_OtherAccount'),
  'Stripe environment mismatch');
 if exists(select 1 from customers where id=c and (checkout_attempt is not null or stripe_subscription_id is not null))
 or exists(select 1 from pilot_setup_slots where customer_id=c)
 or exists(select 1 from stripe_events) or exists(select 1 from usage_periods) then
  raise exception 'Mismatched environment mutated financial state';
 end if;

 -- Every financial customer field blocks rebinding on its own, including an
 -- unresolved attempt with no returned Stripe session and historical paid setup.
 for field in select * from (values
  ('stripe_customer_id',quote_literal('cus_environment_fixture')),
  ('stripe_subscription_id',quote_literal('sub_environment_fixture')),
  ('checkout_attempt','gen_random_uuid()'),
  ('checkout_session_id',quote_literal('cs_environment_fixture')),
  ('setup_price_id',quote_literal('price_pilot_fixture')),
  ('setup_fee_cents','29900'),
  ('setup_paid_at','now()')
 ) as fields(name,value) loop
  execute format('update customers set %I=%s where id=$1',field.name,field.value) using c;
  perform pg_temp.expect_environment_error(
   $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
  perform pg_temp.expect_environment_error(
   $$select set_stripe_environment('test','acct_OtherAccount')$$,blocked);
  -- Reapplying the same environment is harmless even with financial history.
  perform set_stripe_environment('test','acct_EnvironmentTest');
  execute format('update customers set %I=null where id=$1',field.name) using c;
 end loop;

 insert into stripe_events(id) values('evt_environment_history_fixture');
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 delete from stripe_events where id='evt_environment_history_fixture';

 update pilot_setup_slots set customer_id=c where slot=1;
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 update pilot_setup_slots set customer_id=null,redeemed=true where slot=1;
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 update pilot_setup_slots set redeemed=false where slot=1;

 -- Even an unused period preserves billing history; reserved call usage does too.
 insert into usage_periods(customer_id,starts_at,ends_at,plan,included_minutes,overage_cents,monthly_cents)
 values(c,starts,starts+interval '1 month','front',300,49,19900) returning id into p;
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 insert into customer_bookings(customer_id,provider_id,full_name,phone,starts_at,ends_at)
 values(c,'member','Environment fixture','+12125550100',now()+interval '1 day',now()+interval '1 day 30 minutes')
 returning id into b;
 insert into call_usage(booking_id,period_id) values(b,p);
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 delete from call_usage where booking_id=b;
 delete from customer_bookings where id=b;
 delete from usage_periods where id=p;

 -- A correct checkout and subscription use the guarded wrappers normally.
 r:=claim_environment_checkout(c,u,'price_pilot_fixture','price_standard_fixture','test','acct_EnvironmentTest');
 if r.checkout_attempt is null or r.setup_fee_cents<>29900
 or not exists(select 1 from pilot_setup_slots where customer_id=c and not redeemed) then
  raise exception 'Correctly bound checkout did not reserve the pilot offer';
 end if;
 if (claim_environment_checkout(c,u,'price_pilot_fixture','price_standard_fixture','test','acct_EnvironmentTest')).checkout_attempt<>r.checkout_attempt then
  raise exception 'Guarded retry changed checkout identity';
 end if;
 if not apply_environment_subscription('evt_environment_paid_fixture',c,'sub_environment_fixture','cus_environment_fixture',
  'front','active',starts,starts+interval '1 month',true,'test','acct_EnvironmentTest') then
  raise exception 'Correctly bound subscription was not applied';
 end if;
 if apply_environment_subscription('evt_environment_paid_fixture',c,'sub_environment_fixture','cus_environment_fixture',
  'front','active',starts,starts+interval '1 month',true,'test','acct_EnvironmentTest') then
  raise exception 'Guarded subscription replay was applied twice';
 end if;
 if not exists(select 1 from customers where id=c and status='paid' and setup_paid_at is not null)
 or not exists(select 1 from pilot_setup_slots where customer_id=c and redeemed)
 or (select count(*) from usage_periods where customer_id=c)<>1 then
  raise exception 'Guarded payment did not persist its expected state';
 end if;
 perform pg_temp.expect_environment_error(
  $$select set_stripe_environment('live','acct_EnvironmentLive')$$,blocked);
 perform assert_stripe_environment('test','acct_EnvironmentTest');
end $suite$;

set local role anon;
do $$ begin
 begin perform * from billing_environment;raise exception 'Anonymous environment read allowed';
 exception when insufficient_privilege then null;end;
 begin perform set_stripe_environment('live','acct_Forbidden');raise exception 'Anonymous environment switch allowed';
 exception when insufficient_privilege then null;end;
 begin perform claim_environment_checkout(gen_random_uuid(),gen_random_uuid(),'price_pilot','price_standard','test','acct_EnvironmentTest');raise exception 'Anonymous checkout wrapper allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;

set local role authenticated;
do $$ begin
 begin perform * from billing_environment;raise exception 'Browser environment read allowed';
 exception when insufficient_privilege then null;end;
 begin perform set_stripe_environment('live','acct_Forbidden');raise exception 'Browser environment switch allowed';
 exception when insufficient_privilege then null;end;
 begin perform apply_environment_subscription('evt_forbidden',gen_random_uuid(),'sub_forbidden','cus_forbidden','front','active',now(),now()+interval '1 month',true,'test','acct_EnvironmentTest');raise exception 'Browser payment wrapper allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;

rollback;
\echo Stripe environment checks passed: explicit bindings, isolated wrappers, history protection, draft rebinding, replay and access control.
