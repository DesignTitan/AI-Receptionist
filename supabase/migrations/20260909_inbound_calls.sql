begin;

alter table public.customers add column if not exists phone_settings jsonb not null default '{}';
create table public.customer_phone_connections (
 customer_id uuid primary key references public.customers(id) on delete restrict,
 provider text not null, inbound_number text unique, ai_number text, agent_id text, secret_hash text,
 status text not null default 'not_connected' check(status in ('not_connected','testing','ready')),
 verified_at timestamptz,
 check(secret_hash is null or secret_hash ~ '^[a-f0-9]{64}$'),
 check(status <> 'ready' or (inbound_number is not null and ai_number is not null and secret_hash is not null and verified_at is not null))
);
create table public.customer_calls (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references public.customers(id) on delete restrict,
 provider text not null, external_call_id text not null unique, caller_phone text,
 direction text not null default 'inbound' check(direction='inbound'),
 status text not null default 'received' check(status in ('received','active','completed','failed','transferred','voicemail','blocked')),
 result text, booking_id uuid references public.customer_bookings(id) on delete restrict, booking_key text,
 summary text, transcript text, recording_url text, duration_seconds integer check(duration_seconds>=0),
 provider_cost_cents numeric check(provider_cost_cents>=0),
 started_at timestamptz not null default now(), completed_at timestamptz,
 check(length(external_call_id) between 1 and 200),
 check(caller_phone is null or caller_phone ~ '^\+[1-9][0-9]{6,14}$')
);
create index customer_calls_customer_time on public.customer_calls(customer_id,started_at desc);
alter table public.customer_bookings add column source text not null default 'web' check(source in ('web','phone'));
alter table public.customer_bookings add column inbound_call_id uuid unique references public.customer_calls(id) on delete restrict;
alter table public.customer_bookings drop constraint customer_bookings_call_status_check;
alter table public.customer_bookings add constraint customer_bookings_call_status_check
 check(call_status in ('queued','dispatching','ringing','completed','failed','not_required'));

-- Keep outgoing booking-based meter identifiers unchanged. Both ledgers reserve
-- and settle against the same locked usage_periods row.
create table public.inbound_call_usage (
 call_id uuid primary key references public.customer_calls(id) on delete restrict,
 period_id uuid not null references public.usage_periods(id) on delete restrict,
 started_at timestamptz not null default now(), reserved_minutes integer not null default 5 check(reserved_minutes=5),
 seconds integer check(seconds>=0), minutes integer check(minutes between 0 and 5), settled_at timestamptz,
 provider_cost_cents numeric check(provider_cost_cents>=0),
 stripe_state text not null default 'pending' check(stripe_state in ('pending','sent','review')), stripe_error text
);
alter table public.customer_jobs add column call_id uuid references public.customer_calls(id) on delete cascade;
alter table public.customer_jobs drop constraint customer_jobs_kind_check;
alter table public.customer_jobs add constraint customer_jobs_kind_check
 check(kind in ('booking_email','call','call_email','welcome','live','signup_alert','usage_email','inbound_call_email'));
alter table public.customer_phone_connections enable row level security;
alter table public.customer_calls enable row level security;
alter table public.inbound_call_usage enable row level security;
revoke all on public.customer_phone_connections,public.customer_calls,public.inbound_call_usage from public,anon,authenticated;
grant all on public.customer_phone_connections,public.customer_calls,public.inbound_call_usage to service_role;

-- Browser and phone bookings use this same final validation under the customer
-- lock. Never trust an agent-supplied member, duration, opening time or business.
create function public.validate_customer_booking_slot(c_id uuid, member text, begins timestamptz, finishes timestamptz)
returns void language plpgsql security definer set search_path=public as $$
declare c customers; m jsonb; local_start timestamp; local_end timestamp; opening timestamp; closing timestamp; duration integer;
begin
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status<>'live' or c.billing_status is distinct from 'active' then raise exception 'Business is not taking bookings';end if;
 select value into m from jsonb_array_elements(c.config->'team') where value->>'id'=member;
 if m is null then raise exception 'Choose a team member';end if;
 duration:=(m->>'minutes')::integer;
 if duration is null or duration<15 or duration>240 or duration%15<>0 or begins is null or finishes is null
 or finishes<>begins+make_interval(mins=>duration) then raise exception 'Booking duration unavailable';end if;
 local_start:=begins at time zone (c.config->>'timezone');
 local_end:=finishes at time zone (c.config->>'timezone');
 opening:=local_start::date+(c.config->>'opens')::time;
 closing:=local_start::date+(c.config->>'closes')::time;
 if local_start is null or opening is null or closing is null
 or begins<now()+interval '90 minutes'
 or local_start::date<(now() at time zone (c.config->>'timezone'))::date
 or local_start::date>(now() at time zone (c.config->>'timezone'))::date+30
 or not coalesce((c.config->'days') @> jsonb_build_array(extract(dow from local_start)::integer),false)
 or local_start<opening or local_end>closing or local_start>=closing
 or mod(extract(epoch from local_start-opening),duration*60)<>0
 then raise exception 'Booking time unavailable';end if;
end $$;

create or replace function public.reserve_customer_booking(c_id uuid,member text,guest text,telephone text,guest_email text,begins timestamptz,finishes timestamptz)
returns public.customer_bookings language plpgsql security definer set search_path=public as $$
declare c customers; b customer_bookings; confirmation boolean;
begin
 perform validate_customer_booking_slot(c_id,member,begins,finishes);
 select * into c from customers where id=c_id;
 if guest is null or length(trim(guest)) not between 1 and 120 or telephone is null or telephone !~ '^\+1[2-9][0-9]{2}[2-9][0-9]{6}$'
 or (guest_email is not null and length(guest_email)>254) then raise exception 'Check guest details';end if;
 if (select count(*) from customer_bookings where customer_id=c_id and phone=telephone and created_at>now()-interval '24 hours')>=3
 or (select count(*) from customer_bookings where customer_id=c_id and created_at>now()-interval '24 hours')>=100 then raise exception 'Daily booking limit reached';end if;
 confirmation:=coalesce(c.phone_settings->'confirmationCalls','true'::jsonb)<>'false'::jsonb;
 insert into customer_bookings(customer_id,provider_id,full_name,phone,email,starts_at,ends_at,call_status)
 values(c_id,member,trim(guest),telephone,guest_email,begins,finishes,case when confirmation then 'queued' else 'not_required' end) returning * into b;
 insert into customer_jobs(customer_id,booking_id,kind,dedupe_key) values(c_id,b.id,'booking_email','booking-email:'||b.id);
 if confirmation then insert into customer_jobs(customer_id,booking_id,kind,dedupe_key) values(c_id,b.id,'call','call:'||b.id);end if;
 return b;
end $$;

create function public.register_customer_inbound_call(c_id uuid,external_id text,caller text)
returns public.customer_calls language plpgsql security definer set search_path=public as $$
declare connection customer_phone_connections; existing customer_calls;
begin
 perform 1 from customers where id=c_id for update;
 select * into connection from customer_phone_connections where customer_id=c_id;
 if connection.customer_id is null then raise exception 'Phone connection unavailable';end if;
 if external_id is null or length(trim(external_id)) not between 1 and 200
 or (caller is not null and caller !~ '^\+[1-9][0-9]{6,14}$') then raise exception 'Invalid trusted call details';end if;
 insert into customer_calls(customer_id,provider,external_call_id,caller_phone)
 values(c_id,connection.provider,external_id,caller) on conflict(external_call_id) do nothing;
 select * into existing from customer_calls where external_call_id=external_id for update;
 if existing.customer_id<>c_id or existing.provider<>connection.provider or existing.caller_phone is distinct from caller
 then raise exception 'Call belongs to a different connection';end if;
 return existing;
end $$;

create function public.reserve_inbound_call_usage(c_id uuid,call_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare c customers; p usage_periods; incoming customer_calls; u inbound_call_usage; capacity integer;
begin
 select * into c from customers where id=c_id for update;
 select * into incoming from customer_calls where id=call_id and customer_id=c_id for update;
 if incoming.id is null then return false;end if;
 if c.status<>'live' or c.billing_status is distinct from 'active' or c.phone_settings->'inboundEnabled' is distinct from 'true'::jsonb
 or not exists(select 1 from customer_phone_connections where customer_id=c_id and status='ready' and provider=incoming.provider)
 then return false;end if;
 select * into u from inbound_call_usage where inbound_call_usage.call_id=incoming.id;
 if u.call_id is not null then
 return u.settled_at is null and incoming.status='active' and now()<u.started_at+interval '5 minutes';
 end if;
 if incoming.status<>'received' or incoming.completed_at is not null then return false;end if;
 select * into p from usage_periods where customer_id=c_id and starts_at=c.period_start and starts_at<=now() and ends_at>now() for update;
 if p.id is null then return false;end if;
 capacity:=p.included_minutes+floor(c.overage_budget_cents::numeric/p.overage_cents)::integer;
 if p.used_minutes+p.reserved_minutes+5>capacity then
 update customer_calls set status='blocked',result='usage_limit' where id=incoming.id;
 perform usage_notice(c_id,p.id,'calls_paused','AI calls cannot start within your current allowance and spending limit. Use the staff or voicemail fallback; online bookings remain available.','paused:'||p.id||':'||c.overage_budget_cents);
 return false;
 end if;
 insert into inbound_call_usage(call_id,period_id) values(incoming.id,p.id);
 update usage_periods set reserved_minutes=reserved_minutes+5 where id=p.id;
 update customer_calls set status='active' where id=incoming.id;
 return true;
end $$;

create function public.reserve_customer_phone_booking(c_id uuid,call_id uuid,request_key text,member text,guest text,telephone text,guest_email text,begins timestamptz,finishes timestamptz)
returns public.customer_bookings language plpgsql security definer set search_path=public as $$
declare c customers; incoming customer_calls; b customer_bookings;
begin
 select * into c from customers where id=c_id for update;
 select * into incoming from customer_calls where id=call_id and customer_id=c_id for update;
 if incoming.id is null or request_key is null or length(request_key) not between 1 and 120 then raise exception 'Call booking unavailable';end if;
 -- A retry after a successful save must not fail because its own slot is occupied.
 if incoming.booking_id is not null then
 select * into b from customer_bookings where id=incoming.booking_id and customer_id=c_id;
 if incoming.booking_key=request_key and b.provider_id=member and b.full_name=trim(guest) and b.phone=telephone
 and b.email is not distinct from guest_email and b.starts_at=begins and b.ends_at=finishes then return b;end if;
 raise exception 'This call already has a different booking';
 end if;
 if incoming.status<>'active' or incoming.completed_at is not null
 or not exists(select 1 from customer_phone_connections where customer_id=c_id and status='ready' and provider=incoming.provider)
 or not exists(select 1 from inbound_call_usage u where u.call_id=incoming.id and u.settled_at is null and now()<u.started_at+interval '5 minutes')
 then raise exception 'Call booking unavailable';end if;
 perform validate_customer_booking_slot(c_id,member,begins,finishes);
 if guest is null or length(trim(guest)) not between 1 and 120 or telephone is null or telephone !~ '^\+1[2-9][0-9]{2}[2-9][0-9]{6}$'
 or (guest_email is not null and length(guest_email)>254) then raise exception 'Check guest details';end if;
 if (select count(*) from customer_bookings where customer_id=c_id and phone=telephone and created_at>now()-interval '24 hours')>=3
 or (select count(*) from customer_bookings where customer_id=c_id and created_at>now()-interval '24 hours')>=100 then raise exception 'Daily booking limit reached';end if;
 insert into customer_bookings(customer_id,provider_id,full_name,phone,email,starts_at,ends_at,status,call_status,source,inbound_call_id)
 values(c_id,member,trim(guest),telephone,guest_email,begins,finishes,'confirmed','not_required','phone',incoming.id) returning * into b;
 update customer_calls set booking_id=b.id,booking_key=request_key where id=incoming.id;
 insert into customer_jobs(customer_id,booking_id,kind,dedupe_key) values(c_id,b.id,'booking_email','booking-email:'||b.id);
 return b;
end $$;

create function public.notify_customer_usage(c_id uuid,p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c customers; p usage_periods; extra integer;
begin
 select * into c from customers where id=c_id;
 select * into p from usage_periods where id=p_id and customer_id=c_id;
 if c.id is null or p.id is null then return;end if;
 extra:=greatest(0,p.used_minutes-p.included_minutes)*p.overage_cents;
 if p.used_minutes>=ceil(p.included_minutes*0.8) then perform usage_notice(c_id,p.id,'allowance_80','You have used '||p.used_minutes||' of '||p.included_minutes||' included AI minutes. Extra minutes cost $0.49 each only within your chosen spending limit.','allowance80:'||p.id);end if;
 if p.used_minutes>=p.included_minutes then perform usage_notice(c_id,p.id,'allowance_100','Your included AI minutes are used. Extra minutes are $0.49 each, up to your chosen limit. With a $0 limit, new AI calls pause; use staff or voicemail for incoming calls. Online bookings remain available.','allowance100:'||p.id);end if;
 if c.overage_budget_cents>0 and extra>=c.overage_budget_cents*0.8 then perform usage_notice(c_id,p.id,'budget_80','You are approaching your extra-minute spending limit. Extra usage so far is $'||to_char(extra::numeric/100,'FM999990.00')||'. Review your limit and projected bill in your dashboard.','budget80:'||p.id||':'||c.overage_budget_cents);end if;
 if p.used_minutes+p.reserved_minutes+5>p.included_minutes+floor(c.overage_budget_cents::numeric/p.overage_cents) then perform usage_notice(c_id,p.id,'calls_paused','Your remaining budget cannot cover another five-minute AI call. New AI calls pause until usage resets or you raise the limit. Use staff or voicemail for incoming calls; online bookings remain available.','paused:'||p.id||':'||c.overage_budget_cents);end if;
end $$;

create function public.record_customer_inbound_call(c_id uuid,call_id uuid,result text,call_summary text,call_transcript text,recording text,seconds integer,cost_cents numeric default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare incoming customer_calls; u inbound_call_usage; charged integer; final_result text;
begin
 perform 1 from customers where id=c_id for update;
 select * into incoming from customer_calls where id=call_id and customer_id=c_id for update;
 if incoming.id is null then return false;end if;
 if incoming.completed_at is not null then return true;end if;
 if result is null or result not in ('confirmed','booked','completed','transferred','voicemail','no_answer','failed','abandoned','needs_review','blocked','requested_staff','cancelled')
 or seconds is null or seconds<0 or (cost_cents is not null and cost_cents<0) then raise exception 'Valid completed call report required';end if;
 final_result:=case when result in ('booked','confirmed') and incoming.booking_id is null then 'needs_review' else result end;
 select * into u from inbound_call_usage where inbound_call_usage.call_id=incoming.id for update;
 if u.call_id is not null and u.settled_at is null then
 charged:=least(ceil(seconds::numeric/60)::integer,u.reserved_minutes);
 update inbound_call_usage set seconds=record_customer_inbound_call.seconds,minutes=charged,settled_at=now(),provider_cost_cents=cost_cents where inbound_call_usage.call_id=incoming.id;
 update usage_periods set used_minutes=used_minutes+charged,reserved_minutes=reserved_minutes-u.reserved_minutes where id=u.period_id;
 if seconds>300 then
 update customer_phone_connections set status='testing',verified_at=null where customer_id=c_id;
 perform usage_notice(c_id,u.period_id,'provider_limit','Inbound AI is paused for a technical review because a call exceeded five minutes. You will not be billed beyond five AI minutes for this call. Staff fallback and online bookings should remain available.','inbound-provider-limit:'||incoming.id);
 end if;
 perform notify_customer_usage(c_id,u.period_id);
 elsif u.call_id is null and seconds>0 then
 -- A provider that connected AI without admission has created an operator
 -- cost, not an authorized customer charge. Stop further AI until reviewed.
 update customer_phone_connections set status='testing',verified_at=null where customer_id=c_id;
 perform usage_notice(c_id,null,'unreserved_call','Inbound AI is paused for review because a call connected without a minute reservation. These AI minutes were not charged to you. Contact support; staff fallback remains available.','unreserved-inbound:'||incoming.id);
 end if;
 update customer_calls set status=case when final_result='failed' then 'failed' when final_result in ('transferred','requested_staff') then 'transferred' when final_result='voicemail' then 'voicemail' else 'completed' end,
 result=final_result,summary=left(call_summary,30000),transcript=left(call_transcript,100000),
 recording_url=case when recording like 'https://%' then left(recording,3000) else null end,duration_seconds=seconds,provider_cost_cents=cost_cents,completed_at=now()
 where id=incoming.id;
 insert into customer_jobs(customer_id,call_id,booking_id,kind,dedupe_key)
 values(c_id,incoming.id,incoming.booking_id,'inbound_call_email','inbound-call-email:'||incoming.id) on conflict(dedupe_key) do nothing;
 return true;
end $$;

-- An owner can switch confirmations off while a queued web booking is waiting.
create or replace function public.reserve_call_usage(c_id uuid,b_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare c customers;p usage_periods;b customer_bookings;capacity integer;
begin
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status<>'live' or c.billing_status is distinct from 'active' then return false;end if;
 select * into b from customer_bookings where id=b_id and customer_id=c_id for update;
 if b.id is null or b.status<>'pending' or b.source='phone' or b.call_status<>'queued' or exists(select 1 from call_usage where booking_id=b_id) then return false;end if;
 if c.phone_settings->'confirmationCalls'='false'::jsonb then
 update customer_bookings set call_status='not_required' where id=b_id;return false;
 end if;
 select * into p from usage_periods where customer_id=c_id and starts_at=c.period_start and starts_at<=now() and ends_at>now() for update;
 if p.id is null then return false;end if;
 capacity:=p.included_minutes+floor(c.overage_budget_cents::numeric/p.overage_cents)::integer;
 if p.used_minutes+p.reserved_minutes+5>capacity then
 perform usage_notice(c_id,p.id,'calls_paused','AI calls cannot start within your current allowance and spending limit. Use staff or voicemail for incoming calls and confirm online bookings manually.','paused:'||p.id||':'||c.overage_budget_cents);
 update customer_bookings set call_status='failed',summary='Confirmation call not placed: usage allowance or spending limit reached. Please contact this client manually.' where id=b_id;return false;
 end if;
 insert into call_usage(booking_id,period_id) values(b_id,p.id);
 update usage_periods set reserved_minutes=reserved_minutes+5 where id=p.id;
 update customer_bookings set call_status='dispatching' where id=b_id;
 return true;
end $$;

create or replace function public.settle_call_usage(c_id uuid,b_id uuid,duration integer,cost_cents numeric default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare u call_usage;charged integer;
begin
 perform 1 from customers where id=c_id for update;
 select x.* into u from call_usage x join usage_periods q on q.id=x.period_id where x.booking_id=b_id and q.customer_id=c_id for update of x;
 if u.booking_id is null then return false;end if;
 if u.settled_at is not null then return true;end if;
 if duration is null or duration<0 then return false;end if;
 charged:=least(ceil(duration::numeric/60)::integer,u.reserved_minutes);
 update call_usage set seconds=duration,minutes=charged,settled_at=now(),provider_cost_cents=cost_cents where booking_id=b_id;
 update usage_periods set used_minutes=used_minutes+charged,reserved_minutes=reserved_minutes-u.reserved_minutes where id=u.period_id;
 if duration>300 then
 update customers set status='paused',provision_error='Provider exceeded five-minute limit; inspect agent configuration before resuming.' where id=c_id;
 perform usage_notice(c_id,u.period_id,'provider_limit','Your phone assistant is paused for a technical review. You will not be billed beyond five minutes for this call. Contact support.','provider-limit:'||b_id);
 end if;
 perform notify_customer_usage(c_id,u.period_id);
 return true;
end $$;

revoke all on function validate_customer_booking_slot(uuid,text,timestamptz,timestamptz),register_customer_inbound_call(uuid,text,text),reserve_inbound_call_usage(uuid,uuid),reserve_customer_phone_booking(uuid,uuid,text,text,text,text,text,timestamptz,timestamptz),notify_customer_usage(uuid,uuid),record_customer_inbound_call(uuid,uuid,text,text,text,text,integer,numeric) from public,anon,authenticated;
grant execute on function validate_customer_booking_slot(uuid,text,timestamptz,timestamptz),register_customer_inbound_call(uuid,text,text),reserve_inbound_call_usage(uuid,uuid),reserve_customer_phone_booking(uuid,uuid,text,text,text,text,text,timestamptz,timestamptz),notify_customer_usage(uuid,uuid),record_customer_inbound_call(uuid,uuid,text,text,text,text,integer,numeric) to service_role;
commit;
