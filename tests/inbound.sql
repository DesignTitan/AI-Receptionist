\set ON_ERROR_STOP on
-- Apply migrations to a disposable local database first. Every fixture rolls back.
begin;
do $$
declare
 c uuid:=gen_random_uuid(); other_c uuid:=gen_random_uuid();
 owner uuid:=gen_random_uuid(); other_owner uuid:=gen_random_uuid();
 incoming customer_calls; repeated customer_calls; validation_call customer_calls;
 unreserved customer_calls; gated customer_calls; budget_call customer_calls;
 b customer_bookings; retry customer_bookings; outgoing customer_bookings;
 p usage_periods; stored_usage inbound_call_usage; reserved_at timestamptz;
 slot timestamptz:=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')+interval '2 days 10 hours';
 settings jsonb:='{"inboundEnabled":true,"confirmationCalls":true}';
 fixture_config jsonb:='{"timezone":"UTC","days":[0,1,2,3,4,5,6],"opens":"09:00","closes":"17:00","team":[{"id":"member-1","name":"Fixture member","service":"Fixture appointment","minutes":30}]}';
begin
 insert into auth.users(id) values(owner),(other_owner);
 insert into customers(id,owner_id,owner_email,business_name,slug,plan,status,billing_status,config,phone_settings)
 values(c,owner,'inbound@example.test','Inbound fixture','inbound-'||c,'front','live','active',fixture_config,settings),
       (other_c,other_owner,'other@example.test','Other fixture','inbound-other-'||other_c,'front','live','active',fixture_config,settings);
 insert into customer_phone_connections(customer_id,provider,inbound_number,ai_number,agent_id,secret_hash,status,verified_at)
 values(c,'omnidimension','+12125550180','+12125550181','fixture-'||c,repeat('a',64),'ready',now()),
       (other_c,'omnidimension','+12125550182','+12125550183','fixture-'||other_c,repeat('b',64),'ready',now());
 perform sync_usage_period(c,date_trunc('day',now()),date_trunc('day',now())+interval '1 month','front');
 perform sync_usage_period(other_c,date_trunc('day',now()),date_trunc('day',now())+interval '1 month','front');

 -- Provider identities are trusted inputs; duplicates must never move calls between businesses.
 incoming:=register_customer_inbound_call(c,'inbound-fixture-'||c,'+12125550100');
 repeated:=register_customer_inbound_call(c,'inbound-fixture-'||c,'+12125550100');
 if incoming.id is null or incoming.id<>repeated.id or incoming.customer_id<>c or incoming.direction<>'inbound' then
  raise exception 'Registration is not scoped and idempotent';
 end if;
 if (select count(*) from customer_calls where external_call_id='inbound-fixture-'||c)<>1 then raise exception 'Duplicate call row'; end if;
 begin
  perform register_customer_inbound_call(other_c,'inbound-fixture-'||c,'+12125550100');
  raise exception 'Foreign provider identity accepted';
 exception when raise_exception then if sqlerrm<>'Call belongs to a different connection' then raise; end if; end;
 begin
  perform register_customer_inbound_call(c,'inbound-fixture-'||c,'+12125550199');
  raise exception 'Changed trusted caller accepted';
 exception when raise_exception then if sqlerrm<>'Call belongs to a different connection' then raise; end if; end;
 if reserve_inbound_call_usage(other_c,incoming.id) then raise exception 'Foreign call reservation'; end if;
 if record_customer_inbound_call(other_c,incoming.id,'completed',null,null,null,30,null) then raise exception 'Foreign call report'; end if;
 if reserve_inbound_call_usage(c,gen_random_uuid()) then raise exception 'Unknown call reservation'; end if;

 -- Repeating an active reservation acknowledges it without buying another five minutes.
 if not reserve_inbound_call_usage(c,incoming.id) then raise exception 'Inbound reservation refused'; end if;
 select started_at into reserved_at from inbound_call_usage where call_id=incoming.id;
 if not reserve_inbound_call_usage(c,incoming.id) then raise exception 'Active reservation retry refused'; end if;
 if (select reserved_minutes from usage_periods where customer_id=c)<>5 or
    (select started_at from inbound_call_usage where call_id=incoming.id) is distinct from reserved_at then
  raise exception 'Reservation retry changed allowance or start time';
 end if;

 -- A phone booking needs an active, business-scoped call and the same scheduling rules as the website.
 unreserved:=register_customer_inbound_call(c,'unreserved-'||c,'+12125550102');
 begin
  perform reserve_customer_phone_booking(c,unreserved.id,'unreserved','member-1','No AI reservation','+12125550102',null,slot,slot+interval '30 minutes');
  raise exception 'Unreserved call booked';
 exception when raise_exception then if sqlerrm<>'Call booking unavailable' then raise; end if; end;
 begin
  perform reserve_customer_phone_booking(other_c,incoming.id,'foreign','member-1','Wrong business','+12125550100',null,slot,slot+interval '30 minutes');
  raise exception 'Foreign call booked';
 exception when raise_exception then if sqlerrm<>'Call booking unavailable' then raise; end if; end;

 -- Switching AI off stops new admissions while the already admitted caller can finish.
 update customers set phone_settings=jsonb_set(phone_settings,'{inboundEnabled}','false') where id=c;
 b:=reserve_customer_phone_booking(c,incoming.id,'book-once','member-1','Inbound guest','+12125550100','guest@example.test',slot,slot+interval '30 minutes');
 retry:=reserve_customer_phone_booking(c,incoming.id,'book-once','member-1','Inbound guest','+12125550100','guest@example.test',slot,slot+interval '30 minutes');
 if b.id is null or retry.id<>b.id or b.status<>'confirmed' or b.source<>'phone' or b.call_status<>'not_required' then
  raise exception 'Phone booking or retry has incorrect state';
 end if;
 if (select booking_id from customer_calls where id=incoming.id)<>b.id then raise exception 'Call did not retain booking'; end if;
 if (select count(*) from customer_jobs where booking_id=b.id and kind='booking_email')<>1 or
    exists(select 1 from customer_jobs where booking_id=b.id and kind='call') then
  raise exception 'Phone booking duplicated notification or queued an unwanted outbound call';
 end if;
 begin
  perform reserve_customer_phone_booking(c,incoming.id,'book-once','member-1','Changed guest','+12125550100','guest@example.test',slot,slot+interval '30 minutes');
  raise exception 'Changed booking retry accepted';
 exception when raise_exception then if sqlerrm<>'This call already has a different booking' then raise; end if; end;

 update customers set phone_settings=settings where id=c;
 validation_call:=register_customer_inbound_call(c,'validation-'||c,'+12125550101');
 if not reserve_inbound_call_usage(c,validation_call.id) then raise exception 'Validation call reservation refused'; end if;
 begin
  perform record_customer_inbound_call(c,validation_call.id,'invented_result',null,null,null,30,null);
  raise exception 'Unknown report result accepted';
 exception when raise_exception then if sqlerrm<>'Valid completed call report required' then raise; end if; end;
 begin
  perform record_customer_inbound_call(c,validation_call.id,'completed',null,null,null,-1,null);
  raise exception 'Negative report duration accepted';
 exception when raise_exception then if sqlerrm<>'Valid completed call report required' then raise; end if; end;
 begin
  perform record_customer_inbound_call(c,validation_call.id,'completed',null,null,null,30,-1);
  raise exception 'Negative provider cost accepted';
 exception when raise_exception then if sqlerrm<>'Valid completed call report required' then raise; end if; end;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'unknown-member','foreign-member','Guest','+12125550101',null,slot+interval '1 hour',slot+interval '90 minutes');
  raise exception 'Unknown member accepted';
 exception when raise_exception then if sqlerrm<>'Choose a team member' then raise; end if; end;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'wrong-duration','member-1','Guest','+12125550101',null,slot+interval '1 hour',slot+interval '75 minutes');
  raise exception 'Incorrect duration accepted';
 exception when raise_exception then if sqlerrm<>'Booking duration unavailable' then raise; end if; end;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'outside-hours','member-1','Guest','+12125550101',null,slot-interval '2 hours',slot-interval '90 minutes');
  raise exception 'Outside-hours booking accepted';
 exception when raise_exception then if sqlerrm<>'Booking time unavailable' then raise; end if; end;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'off-grid','member-1','Guest','+12125550101',null,slot+interval '5 minutes',slot+interval '35 minutes');
  raise exception 'Off-grid booking accepted';
 exception when raise_exception then if sqlerrm<>'Booking time unavailable' then raise; end if; end;
 update customers set config=jsonb_set(config,'{days}','[]') where id=c;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'closed-day','member-1','Guest','+12125550101',null,slot+interval '1 hour',slot+interval '90 minutes');
  raise exception 'Closed-day booking accepted';
 exception when raise_exception then if sqlerrm<>'Booking time unavailable' then raise; end if; end;
 update customers set config=jsonb_set(config,'{days}','[0,1,2,3,4,5,6]') where id=c;
 begin
  perform reserve_customer_phone_booking(c,validation_call.id,'conflict','member-1','Guest','+12125550101',null,slot,slot+interval '30 minutes');
  raise exception 'Overlapping phone booking accepted';
 exception when exclusion_violation then null; end;
 if exists(select 1 from customer_bookings where customer_id=c and id<>b.id) then raise exception 'Invalid booking left a row'; end if;

 -- Reports remain payable after the owner switches off AI; retries preserve the first terminal report.
 update customers set phone_settings=jsonb_set(phone_settings,'{inboundEnabled}','false') where id=c;
 if not record_customer_inbound_call(c,incoming.id,'booked','Original summary','Original transcript',null,61,14.5) then
  raise exception 'Report after settings change refused';
 end if;
 if not record_customer_inbound_call(c,incoming.id,'failed','Duplicate summary',null,null,299,99) then raise exception 'Report replay refused'; end if;
 select * into stored_usage from inbound_call_usage where call_id=incoming.id;
 if stored_usage.minutes<>2 or stored_usage.seconds<>61 or stored_usage.provider_cost_cents<>14.5 or stored_usage.settled_at is null then raise exception 'Inbound rounding/cost/replay wrong'; end if;
 select * into repeated from customer_calls where id=incoming.id;
 if repeated.result<>'booked' or repeated.summary<>'Original summary' or repeated.transcript<>'Original transcript' or repeated.duration_seconds<>61 then raise exception 'Duplicate report changed terminal data'; end if;
 if (select count(*) from customer_jobs where call_id=incoming.id and kind='inbound_call_email')<>1 then raise exception 'Call report email missing or duplicated'; end if;
 if reserve_inbound_call_usage(c,incoming.id) then raise exception 'Settled call reserved again'; end if;
 retry:=reserve_customer_phone_booking(c,incoming.id,'book-once','member-1','Inbound guest','+12125550100','guest@example.test',slot,slot+interval '30 minutes');
 if retry.id<>b.id then raise exception 'Completed call booking retry did not return original'; end if;
 if (select status from customer_bookings where id=b.id)<>'confirmed' then raise exception 'Call report changed confirmed booking'; end if;

 -- A charged call can end without an appointment; staff/menu calls without an AI reservation are free.
 if not record_customer_inbound_call(c,validation_call.id,'confirmed','No saved booking',null,null,61,null) then raise exception 'Unbooked AI call report refused'; end if;
 if (select booking_id from customer_calls where id=validation_call.id) is not null or
    (select result from customer_calls where id=validation_call.id) is distinct from 'needs_review' then raise exception 'Reserved AI call claimed an unsaved appointment'; end if;
 if not record_customer_inbound_call(c,unreserved.id,'requested_staff','Staff request',null,null,0,5) then raise exception 'Staff report refused'; end if;
 if exists(select 1 from inbound_call_usage where call_id=unreserved.id) then raise exception 'Staff-only call charged'; end if;
 if (select provider_cost_cents from customer_calls where id=unreserved.id) is distinct from 5::numeric or
    (select status from customer_phone_connections where customer_id=c)<>'ready' then raise exception 'Zero-AI staff call lost vendor cost or paused connection'; end if;
 if (select used_minutes from usage_periods where customer_id=c)<>4 or
    (select reserved_minutes from usage_periods where customer_id=c)<>0 then raise exception 'No-booking call metering wrong'; end if;

 -- Each gate is checked on a fresh call so a previous terminal status cannot make the test pass.
 gated:=register_customer_inbound_call(c,'disabled-'||c,'+12125550103');
 if reserve_inbound_call_usage(c,gated.id) then raise exception 'Disabled inbound accepted'; end if;
 update customers set phone_settings=settings where id=c;
 update customer_phone_connections set status='testing' where customer_id=c;
 gated:=register_customer_inbound_call(c,'unready-'||c,'+12125550104');
 if reserve_inbound_call_usage(c,gated.id) then raise exception 'Unverified connection accepted'; end if;
 update customer_phone_connections set status='ready' where customer_id=c;
 update customers set status='paused' where id=c;
 gated:=register_customer_inbound_call(c,'paused-'||c,'+12125550105');
 if reserve_inbound_call_usage(c,gated.id) then raise exception 'Paused customer accepted'; end if;
 update customers set status='live',billing_status='past_due' where id=c;
 gated:=register_customer_inbound_call(c,'unpaid-'||c,'+12125550106');
 if reserve_inbound_call_usage(c,gated.id) then raise exception 'Inactive billing accepted'; end if;
 update customers set billing_status='active' where id=c;
 if exists(select 1 from inbound_call_usage u join customer_calls x on x.id=u.call_id where x.customer_id=c and x.id not in(incoming.id,validation_call.id)) then raise exception 'Denied call consumed allowance'; end if;

 -- A provider's claim is not a booking. Unreserved AI time is our cost and requires review.
 gated:=register_customer_inbound_call(c,'false-booked-'||c,'+12125550113');
 if not record_customer_inbound_call(c,gated.id,'booked','Provider claimed a booking',null,null,0,null) then raise exception 'Unbacked booking report refused'; end if;
 select * into repeated from customer_calls where id=gated.id;
 if repeated.result is distinct from 'needs_review' or repeated.booking_id is not null then raise exception 'Unbacked booked result was trusted'; end if;
 if (select status from customer_phone_connections where customer_id=c)<>'ready' then raise exception 'Zero-AI report paused connection'; end if;

 gated:=register_customer_inbound_call(c,'unreserved-ai-'||c,'+12125550114');
 if not record_customer_inbound_call(c,gated.id,'confirmed','Unexpected AI leg','Vendor transcript',null,61,14.5) then raise exception 'Unreserved AI report refused'; end if;
 if not record_customer_inbound_call(c,gated.id,'failed','Duplicate report',null,null,120,99) then raise exception 'Unreserved AI report replay refused'; end if;
 select * into repeated from customer_calls where id=gated.id;
 if repeated.result is distinct from 'needs_review' or repeated.booking_id is not null or repeated.duration_seconds is distinct from 61 or
    repeated.provider_cost_cents is distinct from 14.5::numeric or repeated.summary is distinct from 'Unexpected AI leg' or repeated.transcript is distinct from 'Vendor transcript' then
  raise exception 'Unreserved AI report lost evidence, changed on replay or trusted an unsaved booking';
 end if;
 if exists(select 1 from inbound_call_usage where call_id=gated.id) or
    (select used_minutes from usage_periods where customer_id=c)<>4 or
    (select reserved_minutes from usage_periods where customer_id=c)<>0 then raise exception 'Unreserved AI time charged owner'; end if;
 if (select status from customer_phone_connections where customer_id=c)<>'testing' or
    (select verified_at from customer_phone_connections where customer_id=c) is not null or
    (select status from customers where id=c)<>'live' then raise exception 'Unreserved AI did not pause only inbound connection'; end if;
 if (select count(*) from usage_notices where customer_id=c and kind='unreserved_call')<>1 or
    not exists(select 1 from usage_notices where customer_id=c and kind='unreserved_call' and period_id is null) then
  raise exception 'Unreserved AI review notice missing, duplicated or assigned a billing period';
 end if;
 if (select count(*) from customer_jobs where call_id=gated.id and kind='inbound_call_email')<>1 then raise exception 'Unreserved AI report email missing or duplicated'; end if;
 update customer_phone_connections set status='ready',verified_at=now() where customer_id=c;

 -- A retry cannot extend the five-minute call window; a provider overrun is capped and pauses only inbound AI.
 gated:=register_customer_inbound_call(c,'expired-'||c,'+12125550112');
 if not reserve_inbound_call_usage(c,gated.id) then raise exception 'Expiry fixture reservation refused'; end if;
 update inbound_call_usage set started_at=now()-interval '6 minutes' where call_id=gated.id;
 if reserve_inbound_call_usage(c,gated.id) then raise exception 'Expired reservation renewed'; end if;
 begin
  perform reserve_customer_phone_booking(c,gated.id,'expired-booking','member-1','Expired call','+12125550112',null,slot+interval '2 hours',slot+interval '150 minutes');
  raise exception 'Expired call booked';
 exception when raise_exception then if sqlerrm<>'Call booking unavailable' then raise; end if; end;
 if not record_customer_inbound_call(c,gated.id,'completed','Provider limit fixture',null,'javascript:invalid',301,50) then raise exception 'Provider overrun report refused'; end if;
 if (select minutes from inbound_call_usage where call_id=gated.id)<>5 or
    (select recording_url from customer_calls where id=gated.id) is not null or
    (select status from customer_phone_connections where customer_id=c)<>'testing' or
    (select status from customers where id=c)<>'live' then raise exception 'Provider overrun charge, recording or inbound pause incorrect'; end if;
 if (select count(*) from usage_notices where customer_id=c and kind='provider_limit')<>1 then raise exception 'Provider limit notice missing'; end if;
 update customer_phone_connections set status='ready',verified_at=now() where customer_id=c;

 -- Outbound confirmations can be switched off independently, including jobs queued earlier.
 outgoing:=reserve_customer_booking(c,'member-1','Queued online guest','+12125550107',null,slot+interval '1 day',slot+interval '1 day 30 minutes');
 update customers set phone_settings=jsonb_set(phone_settings,'{confirmationCalls}','false') where id=c;
 if reserve_call_usage(c,outgoing.id) then raise exception 'Disabled outbound confirmation consumed allowance'; end if;
 if exists(select 1 from call_usage where booking_id=outgoing.id) then raise exception 'Disabled outbound has usage'; end if;
 outgoing:=reserve_customer_booking(c,'member-1','Manual online guest','+12125550108',null,slot+interval '1 day 1 hour',slot+interval '1 day 90 minutes');
 if outgoing.call_status<>'not_required' or exists(select 1 from customer_jobs where booking_id=outgoing.id and kind='call') then raise exception 'New manual booking queued confirmation'; end if;
 if (select count(*) from customer_jobs where booking_id=outgoing.id and kind='booking_email')<>1 then raise exception 'Manual booking email missing'; end if;

 -- Both directions draw from the same allowance. Opt-in extra minutes use the same 49-cent rate.
 update customers set phone_settings=settings where id=c;
 update usage_periods set used_minutes=included_minutes-5 where customer_id=c;
 outgoing:=reserve_customer_booking(c,'member-1','Shared capacity guest','+12125550109',null,slot+interval '1 day 2 hours',slot+interval '1 day 150 minutes');
 if not reserve_call_usage(c,outgoing.id) then raise exception 'Outbound five-minute reservation failed'; end if;
 budget_call:=register_customer_inbound_call(c,'capacity-'||c,'+12125550110');
 if reserve_inbound_call_usage(c,budget_call.id) then raise exception 'Inbound ignored outbound reserved minutes'; end if;
 if not settle_call_usage(c,outgoing.id,60,null) then raise exception 'Outbound settlement failed'; end if;
 if not exists(select 1 from usage_notices where customer_id=c and kind='calls_paused') then raise exception 'Capacity notice missing'; end if;
 perform set_usage_budget(c,owner,490);
 update usage_periods set used_minutes=included_minutes-1 where customer_id=c;
 budget_call:=register_customer_inbound_call(c,'extra-'||c,'+12125550111');
 if not reserve_inbound_call_usage(c,budget_call.id) then raise exception 'Opt-in inbound minutes refused'; end if;
 if not record_customer_inbound_call(c,budget_call.id,'completed','Extra minutes fixture',null,null,121,null) then raise exception 'Extra-minute report refused'; end if;
 select * into p from usage_periods where customer_id=c;
 if p.used_minutes<>302 or p.reserved_minutes<>0 or greatest(0,p.used_minutes-p.included_minutes)*p.overage_cents<>98 then raise exception 'Inbound extra-minute billing wrong'; end if;
 if (select count(*) from usage_notices where customer_id=c and kind='allowance_100')<>1 then raise exception 'Full-allowance notice missing or duplicated'; end if;
 if (select used_minutes+reserved_minutes from usage_periods where customer_id=other_c)<>0 then raise exception 'Other business usage changed'; end if;
end $$;

-- Browser roles cannot bypass server authentication through tables or any new RPC.
set local role anon;
do $$ begin
 begin perform * from customer_calls;raise exception 'Anonymous call data exposed';exception when insufficient_privilege then null;end;
 begin perform * from inbound_call_usage;raise exception 'Anonymous usage exposed';exception when insufficient_privilege then null;end;
 begin perform * from customer_phone_connections;raise exception 'Anonymous connection secret exposed';exception when insufficient_privilege then null;end;
 begin perform register_customer_inbound_call(gen_random_uuid(),'anon','+12125550100');raise exception 'Anonymous registration allowed';exception when insufficient_privilege then null;end;
 begin perform reserve_inbound_call_usage(gen_random_uuid(),gen_random_uuid());raise exception 'Anonymous reservation allowed';exception when insufficient_privilege then null;end;
 begin perform record_customer_inbound_call(gen_random_uuid(),gen_random_uuid(),'completed',null,null,null,60,null);raise exception 'Anonymous settlement allowed';exception when insufficient_privilege then null;end;
 begin perform reserve_customer_phone_booking(gen_random_uuid(),gen_random_uuid(),'anon','member-1','Guest','+12125550100',null,now()+interval '2 days',now()+interval '2 days 30 minutes');raise exception 'Anonymous booking allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform * from customer_calls;raise exception 'Authenticated unscoped calls exposed';exception when insufficient_privilege then null;end;
 begin perform * from customer_phone_connections;raise exception 'Authenticated connection secret exposed';exception when insufficient_privilege then null;end;
 begin perform reserve_inbound_call_usage(gen_random_uuid(),gen_random_uuid());raise exception 'Authenticated direct reservation allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
\echo 'Inbound SQL checks passed: call identity, account isolation, retries, scheduling, confirmed phone bookings, independent controls, unbooked call usage, shared allowance, extra minutes, notices and browser-role denial.'
