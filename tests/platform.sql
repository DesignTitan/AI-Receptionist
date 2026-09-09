\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into customers(id,owner_id,owner_email,business_name,slug,plan,status,billing_status,config)
values('aaaaaaaa-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a@example.test','A','a','front','live','active','{"timezone":"UTC","days":[0,1,2,3,4,5,6],"opens":"09:00","closes":"17:00","team":[{"id":"member-1","name":"Fixture member","service":"Fixture service","minutes":30}]}'),
('bbbbbbbb-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','b@example.test','B','b','busy','draft',null,'{}');
do $$
declare b customer_bookings; first_attempt customers; repeated customers;
slot timestamptz:=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC') + interval '2 days 10 hours';
begin
 b:=reserve_customer_booking('aaaaaaaa-1111-4111-8111-111111111111','member-1','Test','+12125550100',null,slot,slot+interval '30 minutes');
 if length(b.reference)<>48 then raise exception 'Weak confirmation token'; end if;
 if (select count(*) from customer_jobs where booking_id=b.id)<>2 then raise exception 'Jobs not atomically created'; end if;
 begin
 perform reserve_customer_booking('aaaaaaaa-1111-4111-8111-111111111111','member-1','Overlap','+12125550101',null,slot,slot+interval '30 minutes');
 raise exception 'Overlap accepted'; exception when exclusion_violation then null; end;
 begin
 perform reserve_customer_booking('bbbbbbbb-1111-4111-8111-111111111111','member-1','Unpaid','+12125550100',null,slot,slot+interval '30 minutes');
 raise exception 'Unpaid accepted'; exception when raise_exception then if sqlerrm<>'Business is not taking bookings' then raise; end if; end;
 update customer_bookings set status='cancelled' where id=b.id;
 perform record_customer_call('aaaaaaaa-1111-4111-8111-111111111111',b.id,'confirmed','Test summary',null,null,30);
 perform record_customer_call('aaaaaaaa-1111-4111-8111-111111111111',b.id,'cancelled','Late duplicate',null,null,40);
 if (select status from customer_bookings where id=b.id)<>'cancelled' then raise exception 'Call undid cancellation'; end if;
 if (select outcome from customer_bookings where id=b.id)<>'confirmed' then raise exception 'Duplicate overwrote terminal result'; end if;
 if (select count(*) from customer_jobs where booking_id=b.id and kind='call_email')<>1 then raise exception 'Duplicate call email'; end if;
 if record_customer_call('bbbbbbbb-1111-4111-8111-111111111111',b.id,'confirmed',null,null,null,30) then raise exception 'Foreign call accepted'; end if;
 perform reserve_customer_booking('aaaaaaaa-1111-4111-8111-111111111111','member-1','Replacement','+12125550102',null,slot,slot+interval '30 minutes');
 first_attempt:=claim_customer_checkout('bbbbbbbb-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 repeated:=claim_customer_checkout('bbbbbbbb-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 if first_attempt.checkout_attempt<>repeated.checkout_attempt then raise exception 'Checkout not idempotent'; end if;
 begin
 perform claim_customer_checkout('bbbbbbbb-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 raise exception 'Foreign checkout accepted'; exception when raise_exception then if sqlerrm<>'Checkout unavailable' then raise; end if; end;
 perform apply_customer_subscription('evt_one','bbbbbbbb-1111-4111-8111-111111111111','sub_one','cus_one','busy','active');
 if apply_customer_subscription('evt_one','bbbbbbbb-1111-4111-8111-111111111111','sub_one','cus_one','busy','active') then raise exception 'Duplicate event applied'; end if;
 if (select count(*) from customer_jobs where kind='welcome')<>1 then raise exception 'Duplicate welcome'; end if;
 if (select status from customers where slug='b')<>'paid' then raise exception 'Payment did not queue provisioning'; end if;
 perform activate_customer('bbbbbbbb-1111-4111-8111-111111111111','live','123','456','+12125550103');
 perform activate_customer('bbbbbbbb-1111-4111-8111-111111111111','live','123','456','+12125550103');
 if (select count(*) from customer_jobs where kind='live')<>1 then raise exception 'Duplicate live email'; end if;
 perform apply_customer_subscription('evt_two','bbbbbbbb-1111-4111-8111-111111111111','sub_one','cus_one','busy','past_due');
 if (select status from customers where slug='b')<>'paused' then raise exception 'Payment failure did not pause'; end if;
 if exists(select 1 from claim_customer_jobs(20) where state<>'working') then raise exception 'Queue claim incorrect'; end if;
 if exists(select 1 from claim_customer_jobs(20)) then raise exception 'Job claimed twice'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform * from customers;raise exception 'Customer data exposed';exception when insufficient_privilege then null;end;
 begin perform * from customer_bookings;raise exception 'Bookings exposed';exception when insufficient_privilege then null;end;
 begin perform claim_customer_jobs(10);raise exception 'Anonymous RPC exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
\echo 'Platform SQL checks passed: overlap, cancellation, unpaid refusal, owner scope, checkout idempotency, webhook replay, billing pause, queue claims, anonymous denial.'
