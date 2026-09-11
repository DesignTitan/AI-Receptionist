-- Disposable database only; all fixtures roll back.
begin;
do $$
declare u uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); r customers; first_attempt uuid;
begin
 insert into auth.users(id) values(u);
 insert into customers(id,owner_id,owner_email,business_name,slug,plan,config)
 values(c,u,'fixture@example.test','Fixture','flat-'||c,'busy','{}');
 perform set_stripe_environment('test','acct_FlatFixture');
 r:=claim_flat_checkout(c,u,'price_flat_89','test','acct_FlatFixture');
 if r.setup_fee_cents<>8900 or r.setup_price_id<>'price_flat_89' then raise exception 'Incorrect fixed price'; end if;
 first_attempt:=r.checkout_attempt;
 r:=claim_flat_checkout(c,u,'price_different','test','acct_FlatFixture');
 if r.checkout_attempt<>first_attempt or r.setup_price_id<>'price_flat_89' then raise exception 'Reservation changed';end if;
 if exists(select 1 from pilot_setup_slots where customer_id=c) then raise exception 'Pilot slot used';end if;
 begin
 perform claim_flat_checkout(c,gen_random_uuid(),'price_flat_89','test','acct_FlatFixture');
 raise exception 'Wrong owner accepted';
 exception when raise_exception then if sqlerrm<>'Checkout unavailable' then raise;end if;end;
 perform release_pilot_checkout(c,first_attempt);
 update customers set plan='full' where id=c;
 r:=claim_flat_checkout(c,u,'price_full_499','test','acct_FlatFixture');
 if r.setup_fee_cents<>49900 then raise exception 'Incorrect full setup';end if;
 perform release_pilot_checkout(c,r.checkout_attempt);
 update customers set plan='front' where id=c;
 r:=claim_flat_checkout(c,u,'price_flat_89','test','acct_FlatFixture');
 if r.setup_fee_cents<>8900 then raise exception 'Incorrect front setup';end if;
 perform apply_environment_subscription('evt_flat',c,'sub_flat','cus_flat','front','active',now(),now()+interval '1 month',true,'test','acct_FlatFixture');
 if not exists(select 1 from customers where id=c and setup_paid_at is not null and status='paid') then raise exception 'Payment not applied';end if;
end $$;
rollback;
