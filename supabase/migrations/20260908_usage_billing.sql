begin;
create table if not exists public.pricing_plans (
 id text primary key, version text not null, monthly_cents integer not null, included_minutes integer not null,
 overage_cents integer not null, team_limit integer not null
);
insert into public.pricing_plans values ('front','minutes-v2',19900,300,49,3),('busy','minutes-v2',39900,750,49,10),('full','minutes-v2',74900,1500,49,20)
on conflict(id) do update set version=excluded.version,monthly_cents=excluded.monthly_cents,included_minutes=excluded.included_minutes,overage_cents=excluded.overage_cents,team_limit=excluded.team_limit;
alter table public.customers add column if not exists period_start timestamptz;
alter table public.customers add column if not exists period_end timestamptz;
alter table public.customers add column if not exists pricing_version text not null default 'minutes-v2';
alter table public.customers add column if not exists overage_budget_cents integer not null default 0 check(overage_budget_cents between 0 and 50000);
create table if not exists public.usage_periods (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
 starts_at timestamptz not null, ends_at timestamptz not null, plan text not null references public.pricing_plans(id),
 included_minutes integer not null, overage_cents integer not null, monthly_cents integer not null,
 used_minutes integer not null default 0 check(used_minutes>=0), reserved_minutes integer not null default 0 check(reserved_minutes>=0),
 unique(customer_id,starts_at),check(ends_at>starts_at)
);
create table if not exists public.call_usage (
 booking_id uuid primary key references public.customer_bookings(id) on delete restrict,
 period_id uuid not null references public.usage_periods(id) on delete restrict,
 started_at timestamptz not null default now(), reserved_minutes integer not null default 5,
 seconds integer, minutes integer, settled_at timestamptz, provider_cost_cents numeric,
 stripe_state text not null default 'pending' check(stripe_state in('pending','sent','review')), stripe_error text,
 check(seconds is null or seconds>=0),check(minutes is null or minutes>=0)
);
create table if not exists public.usage_notices (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
 period_id uuid references public.usage_periods(id) on delete cascade, kind text not null, message text not null,
 dedupe_key text not null unique, created_at timestamptz not null default now()
);
alter table public.customer_jobs drop constraint if exists customer_jobs_kind_check;
alter table public.customer_jobs add constraint customer_jobs_kind_check check(kind in ('booking_email','call','call_email','welcome','live','signup_alert','usage_email'));
alter table public.customer_jobs add column if not exists notice_id uuid references public.usage_notices(id) on delete cascade;
create or replace function public.usage_notice(c uuid,p uuid,k text,msg text,d text) returns void language plpgsql security definer set search_path=public as $$
declare n uuid;
begin
 insert into usage_notices(customer_id,period_id,kind,message,dedupe_key) values(c,p,k,msg,d) on conflict(dedupe_key) do nothing returning id into n;
 if n is not null then insert into customer_jobs(customer_id,kind,notice_id,dedupe_key) values(c,'usage_email',n,'usage-email:'||n);end if;
end $$;
create or replace function public.sync_usage_period(c_id uuid,p_start timestamptz,p_end timestamptz,p_plan text)
returns void language plpgsql security definer set search_path=public as $$
declare c customers; rules pricing_plans; existing usage_periods;
begin
 select * into c from customers where id=c_id for update;
 select * into rules from pricing_plans where id=p_plan;
 if c.id is null or rules.id is null or p_end<=p_start then raise exception 'Invalid period';end if;
 select * into existing from usage_periods where customer_id=c_id and starts_at=p_start;
 if existing.id is not null and (existing.plan<>p_plan or existing.ends_at<>p_end) then raise exception 'Mid-cycle plan changes need reconciliation';end if;
 insert into usage_periods(customer_id,starts_at,ends_at,plan,included_minutes,overage_cents,monthly_cents)
 values(c_id,p_start,p_end,p_plan,rules.included_minutes,rules.overage_cents,rules.monthly_cents) on conflict(customer_id,starts_at) do nothing;
 if c.period_start is null or p_start>=c.period_start then update customers set period_start=p_start,period_end=p_end where id=c_id;end if;
end $$;
-- Lock customer then period consistently. Reserve the maximum duration before any external call.
create or replace function public.reserve_call_usage(c_id uuid,b_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare c customers;p usage_periods;b customer_bookings;capacity integer;
begin
 select * into c from customers where id=c_id for update;
 if c.id is null or c.status<>'live' or c.billing_status is distinct from 'active' then return false;end if;
 select * into p from usage_periods where customer_id=c_id and starts_at=c.period_start and starts_at<=now() and ends_at>now() for update;
 if p.id is null then return false;end if;
 select * into b from customer_bookings where id=b_id and customer_id=c_id for update;
 if b.id is null or b.status='cancelled' or b.call_status<>'queued' or exists(select 1 from call_usage where booking_id=b_id) then return false;end if;
 capacity:=p.included_minutes+floor(c.overage_budget_cents::numeric/p.overage_cents)::integer;
 if p.used_minutes+p.reserved_minutes+5>capacity then
 perform usage_notice(c_id,p.id,'calls_paused','New confirmation calls are paused because fewer than 5 unreserved minutes remain within your allowance and spending limit. Online bookings stay open; please confirm these bookings yourself or raise your limit.','paused:'||p.id||':'||c.overage_budget_cents);
 update customer_bookings set call_status='failed',summary='Confirmation call not placed: usage allowance or spending limit reached. Please contact this client manually.' where id=b_id;
 return false;
 end if;
 insert into call_usage(booking_id,period_id) values(b_id,p.id);
 update usage_periods set reserved_minutes=reserved_minutes+5 where id=p.id;
 update customer_bookings set call_status='dispatching' where id=b_id;
 return true;
end $$;
create or replace function public.settle_call_usage(c_id uuid,b_id uuid,duration integer,cost_cents numeric default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare c customers;u call_usage;p usage_periods;charged integer;extra integer;
begin
 select * into c from customers where id=c_id for update;
 select x.* into u from call_usage x join usage_periods q on q.id=x.period_id where x.booking_id=b_id and q.customer_id=c_id for update of x;
 if u.booking_id is null then return false;end if;
 if u.settled_at is not null then return true;end if;
 if duration is null or duration<0 then return false;end if;
 select * into p from usage_periods where id=u.period_id for update;
 -- Customer never pays beyond the reserved five minutes; a provider limit failure is our cost.
 charged:=least(ceil(duration::numeric/60)::integer,u.reserved_minutes);
 update call_usage set seconds=duration,minutes=charged,settled_at=now(),provider_cost_cents=cost_cents where booking_id=b_id;
 update usage_periods set used_minutes=used_minutes+charged,reserved_minutes=reserved_minutes-u.reserved_minutes where id=p.id returning * into p;
 extra:=greatest(0,p.used_minutes-p.included_minutes)*p.overage_cents;
 if duration>300 then
 update customers set status='paused',provision_error='Provider exceeded five-minute limit; inspect agent configuration before resuming.' where id=c_id;
 perform usage_notice(c_id,p.id,'provider_limit','Your phone assistant is paused for a technical review. You will not be billed beyond five minutes for this call. Online booking availability may be affected; contact support.','provider-limit:'||b_id);
 end if;
 if p.used_minutes>=ceil(p.included_minutes*0.8) then perform usage_notice(c_id,p.id,'allowance_80','You have used '||p.used_minutes||' of '||p.included_minutes||' included minutes. Extra minutes cost $0.49 each only within your chosen spending limit. Check your usage dashboard.','allowance80:'||p.id);end if;
 if p.used_minutes>=p.included_minutes then perform usage_notice(c_id,p.id,'allowance_100','Your included minutes are used. Extra minutes are $0.49 each, up to your chosen limit. With a $0 limit, new confirmation calls pause; bookings remain available.','allowance100:'||p.id);end if;
 if c.overage_budget_cents>0 and extra>=c.overage_budget_cents*0.8 then perform usage_notice(c_id,p.id,'budget_80','You are approaching your extra-minute spending limit. Extra usage so far is $'||to_char(extra::numeric/100,'FM999990.00')||'. Review your limit and projected bill in your dashboard.','budget80:'||p.id||':'||c.overage_budget_cents);end if;
 if p.used_minutes+p.reserved_minutes+5>p.included_minutes+floor(c.overage_budget_cents::numeric/p.overage_cents) then perform usage_notice(c_id,p.id,'calls_paused','Your remaining budget cannot safely cover another five-minute call. New confirmation calls pause until usage resets or you raise your limit; online bookings stay open.','paused:'||p.id||':'||c.overage_budget_cents);end if;
 return true;
end $$;
create or replace function public.set_usage_budget(c_id uuid,user_id uuid,cents integer) returns void language plpgsql security definer set search_path=public as $$
declare c customers;p usage_periods;committed integer;
begin
 select * into c from customers where id=c_id and owner_id=user_id for update;
 if c.id is null or cents<0 or cents>50000 then raise exception 'Invalid budget';end if;
 select * into p from usage_periods where customer_id=c_id and starts_at=c.period_start for update;
 committed:=greatest(0,coalesce(p.used_minutes,0)+coalesce(p.reserved_minutes,0)-coalesce(p.included_minutes,0))*49;
 if cents<committed then raise exception 'Limit cannot be below usage already committed, including active calls';end if;
 update customers set overage_budget_cents=cents where id=c_id;
 perform usage_notice(c_id,p.id,'budget_changed','Your extra-minute limit is now $'||to_char(cents::numeric/100,'FM999990.00')||' per billing month. Extra minutes cost $0.49 each. This limit repeats until you change it.','budget-change:'||gen_random_uuid());
end $$;
alter table pricing_plans enable row level security;
alter table usage_periods enable row level security;
alter table call_usage enable row level security;
alter table usage_notices enable row level security;
revoke all on pricing_plans,usage_periods,call_usage,usage_notices from anon,authenticated;
grant all on pricing_plans,usage_periods,call_usage,usage_notices to service_role;
revoke all on function usage_notice(uuid,uuid,text,text,text),sync_usage_period(uuid,timestamptz,timestamptz,text),reserve_call_usage(uuid,uuid),settle_call_usage(uuid,uuid,integer,numeric),set_usage_budget(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function usage_notice(uuid,uuid,text,text,text),sync_usage_period(uuid,timestamptz,timestamptz,text),reserve_call_usage(uuid,uuid),settle_call_usage(uuid,uuid,integer,numeric),set_usage_budget(uuid,uuid,integer) to service_role;
-- Subscription status and period provisioning succeed or fail together.
create or replace function public.apply_billed_subscription(event_id text,c_id uuid,subscription text,stripe_customer text,new_plan text,subscription_status text,p_start timestamptz,p_end timestamptz)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 perform 1 from customers where id=c_id for update;
 if exists(select 1 from stripe_events where id=event_id) then return false;end if;
 perform sync_usage_period(c_id,p_start,p_end,new_plan);
 return apply_customer_subscription(event_id,c_id,subscription,stripe_customer,new_plan,subscription_status);
end $$;
revoke all on function apply_billed_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function apply_billed_subscription(text,uuid,text,text,text,text,timestamptz,timestamptz) to service_role;
create or replace function public.enforce_plan_team_limit() returns trigger language plpgsql set search_path=public as $$
declare maximum integer;
begin
 select team_limit into maximum from pricing_plans where id=new.plan;
 if jsonb_typeof(new.config->'team')='array' and jsonb_array_length(new.config->'team')>maximum then
  raise exception 'Team exceeds plan limit; adjust the roster before changing plans';
 end if;
 return new;
end $$;
drop trigger if exists customer_plan_team_limit on public.customers;
create trigger customer_plan_team_limit before insert or update of config,plan on public.customers for each row execute function public.enforce_plan_team_limit();
commit;
