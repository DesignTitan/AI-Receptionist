-- ============================================================================
-- Delete everything held about one client, by phone number.
-- Run when a client asks for their data to be removed. Set target_phone to the
-- number AS STORED (the app normalises phones on save — check the clients
-- table first with the SELECT below), then run the whole file.
--
-- Recordings live at the voice provider, not here: delete them there too
-- (call_logs.recording_url / provider_call_id tell you which).
-- ============================================================================

-- 1. Find the stored form of the number.
-- select id, full_name, phone from public.clients where phone like '%5550142%';

do $$
declare
  target_phone text := '+14155550142';   -- ← set me
  n_clients int; n_appts int; n_calls int; n_notes int;
begin
  -- notification_logs only SET NULL on appointment delete but still hold the
  -- recipient address and subject, so remove them explicitly first.
  with appts as (
    select a.id from public.appointments a
    join public.clients c on c.id = a.client_id
    where c.phone = target_phone
  )
  delete from public.notification_logs where appointment_id in (select id from appts);
  get diagnostics n_notes = row_count;

  select count(*) into n_calls from public.call_logs cl
    join public.clients c on c.id = cl.client_id where c.phone = target_phone;
  select count(*) into n_appts from public.appointments a
    join public.clients c on c.id = a.client_id where c.phone = target_phone;

  -- Cascades: appointments.client_id and call_logs.client_id are ON DELETE CASCADE.
  delete from public.clients where phone = target_phone;
  get diagnostics n_clients = row_count;

  raise notice 'deleted % client(s), % appointment(s), % call log(s), % notification log(s) for %',
    n_clients, n_appts, n_calls, n_notes, target_phone;
end $$;

-- 2. Verify nothing remains (all four should be 0).
-- select
--   (select count(*) from public.clients where phone = '+14155550142') as clients,
--   (select count(*) from public.appointments a join public.clients c on c.id=a.client_id where c.phone = '+14155550142') as appointments,
--   (select count(*) from public.call_logs cl join public.clients c on c.id=cl.client_id where c.phone = '+14155550142') as call_logs,
--   (select count(*) from public.notification_logs n join public.appointments a on a.id=n.appointment_id join public.clients c on c.id=a.client_id where c.phone = '+14155550142') as notification_logs;
