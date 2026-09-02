-- ============================================================================
-- Weekly ops check (~15 minutes). Save these as snippets in the Supabase SQL
-- editor. These are the three ways the product breaks silently for a customer,
-- plus a pulse on volume.
-- ============================================================================

-- 1. Calls that failed to place or complete in the last 7 days.
--    A burst here usually means the voice provider, a bad number format, or a
--    webhook secret mismatch. `error` has the provider's message.
select cl.created_at, a.vertical, a.reference, c.full_name, c.phone, cl.provider, cl.status, cl.error
from public.call_logs cl
join public.appointments a on a.id = cl.appointment_id
join public.clients c on c.id = cl.client_id
where cl.status = 'failed' and cl.created_at > now() - interval '7 days'
order by cl.created_at desc;

-- 2. Emails that failed to send in the last 7 days.
--    Usually Resend: a bad API key, an unverified domain, or a bounced owner address.
select n.created_at, a.vertical, a.reference, n.recipient, n.subject, n.error
from public.notification_logs n
left join public.appointments a on a.id = n.appointment_id
where n.status = 'failed' and n.created_at > now() - interval '7 days'
order by n.created_at desc;

-- 3. Bookings still waiting on a human: no answer / reschedule requested, and
--    nobody has touched them for more than a day. This is the customer's queue,
--    but if it grows unattended, they've stopped looking at the dashboard.
select a.vertical, a.reference, a.status, a.updated_at, c.full_name, c.phone, a.starts_at
from public.appointments a
join public.clients c on c.id = a.client_id
where a.status in ('no_answer', 'rescheduled')
  and a.updated_at < now() - interval '1 day'
  and a.starts_at > now()
order by a.starts_at;

-- 4. Volume and confirmation rate per business, last 30 days. Watch the rate:
--    below ~85% first-call confirmation means the script or the number needs work.
select a.vertical,
       count(*)                                                   as bookings,
       count(*) filter (where a.status = 'confirmed')             as confirmed,
       round(100.0 * count(*) filter (where a.status = 'confirmed') / nullif(count(*), 0)) as confirmed_pct,
       round(avg(cl.duration_seconds) filter (where cl.status = 'completed')) as avg_call_seconds,
       round(sum(cl.cost)::numeric, 2)                            as call_cost
from public.appointments a
left join public.call_logs cl on cl.appointment_id = a.id
where a.created_at > now() - interval '30 days'
group by a.vertical
order by bookings desc;

-- 5. Appointments in the next 7 days with no completed confirmation call — the
--    ones a person should ring by hand.
select a.vertical, a.reference, a.starts_at, c.full_name, c.phone, a.status,
       coalesce((select max(status) from public.call_logs where appointment_id = a.id), 'none') as latest_call
from public.appointments a
join public.clients c on c.id = a.client_id
where a.starts_at between now() and now() + interval '7 days'
  and a.status not in ('confirmed', 'cancelled')
order by a.starts_at;
