-- Operator-controlled deletion. First inspect the selected business; this script defaults to
-- a nonexistent UUID and ROLLBACK. Cancel billing and release its number before deletion.
-- Replace the UUID only after an authenticated owner request, review SELECT output, then
-- change ROLLBACK to COMMIT to execute. auth.users deletion is a separate deliberate action.
begin;
create temporary table deletion_target(id uuid primary key);
insert into deletion_target values ('00000000-0000-0000-0000-000000000000');
select c.id,c.business_name,c.owner_email,c.status,c.stripe_subscription_id,c.number_id,
 (select count(*) from public.customer_bookings b where b.customer_id=c.id) as bookings
from public.customers c join deletion_target t using(id);
do $$ begin
 if exists(select 1 from public.customers where id in(select id from deletion_target) and billing_status not in('canceled','incomplete_expired')) then
  raise exception 'Cancel billing before deleting customer data';
 end if;
end $$;
delete from public.customer_jobs where customer_id in(select id from deletion_target);
delete from public.call_usage where period_id in(select id from public.usage_periods where customer_id in(select id from deletion_target));
delete from public.customer_bookings where customer_id in(select id from deletion_target);
delete from public.customers where id in(select id from deletion_target) and billing_status in('canceled','incomplete_expired');
rollback;
