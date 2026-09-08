begin;
do $$ declare i integer;c uuid;u uuid;r customers;first_customer uuid;old_attempt uuid;begin
 for i in 1..11 loop
  u:=gen_random_uuid();c:=gen_random_uuid();
  insert into auth.users(id) values(u);
  insert into customers(id,owner_id,owner_email,business_name,slug,plan,config) values(c,u,'pilot@example.test','Pilot test','pilot-'||c,'front','{}');
  r:=claim_pilot_checkout(c,u,'price_pilot','price_standard');
  if r.setup_fee_cents<>(case when i<=10 then 29900 else 49900 end) then raise exception 'Incorrect pilot allocation';end if;
  if (claim_pilot_checkout(c,u,'price_pilot','price_standard')).checkout_attempt<>r.checkout_attempt then raise exception 'Retry changed attempt';end if;
  if i=1 then first_customer:=c;old_attempt:=r.checkout_attempt;end if;
 end loop;
 if (select count(*) from pilot_setup_slots where customer_id is not null)<>10 then raise exception 'Slot count wrong';end if;
 if release_pilot_checkout(first_customer,gen_random_uuid()) then raise exception 'Stale release';end if;
 if not release_pilot_checkout(first_customer,old_attempt) then raise exception 'Release failed';end if;
 select * into r from customers where id=first_customer;
 r:=claim_pilot_checkout(r.id,r.owner_id,'price_pilot','price_standard');
 if r.setup_fee_cents<>29900 or r.checkout_attempt=old_attempt then raise exception 'Released place not reusable';end if;
 if release_pilot_checkout(first_customer,old_attempt) then raise exception 'Old release cleared new attempt';end if;
 begin
 perform apply_pilot_subscription('evt_unpaid_test',r.id,'sub_pilot','cus_pilot','front','active',now(),now()+interval '1 month',false);
 raise exception 'Unverified payment accepted';
 exception when others then if sqlerrm='Unverified payment accepted' then raise;end if;end;
 perform apply_pilot_subscription('evt_paid_test',r.id,'sub_pilot','cus_pilot','front','active',date_trunc('hour',now()),date_trunc('hour',now())+interval '1 month',true);
 perform apply_pilot_subscription('evt_paid_test',r.id,'sub_pilot','cus_pilot','front','active',date_trunc('hour',now()),date_trunc('hour',now())+interval '1 month',true);
 if not exists(select 1 from pilot_setup_slots where customer_id=r.id and redeemed) then raise exception 'Paid place not redeemed';end if;
 if release_pilot_checkout(r.id,r.checkout_attempt) then raise exception 'Paid place released';end if;
 delete from usage_periods where customer_id=r.id;
 delete from customers where id=r.id;
 if (select count(*) from pilot_setup_slots where redeemed)<>1 then raise exception 'Deletion reopened a paid pilot place';end if;
end $$;
set local role anon;
do $$ begin begin perform * from pilot_setup_slots;raise exception 'Anonymous slot access';exception when insufficient_privilege then null;end;end $$;
reset role;
rollback;
\echo Pilot checks passed: ten-place cap, frozen retry, safe release, paid verification, replay, deletion and access control.
