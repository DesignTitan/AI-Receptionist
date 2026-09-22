begin;
create table if not exists public.voice_demo_limits (
 key text primary key, attempts integer not null, reset_at timestamptz not null
);
alter table public.voice_demo_limits enable row level security;
revoke all on public.voice_demo_limits from anon, authenticated;
grant all on public.voice_demo_limits to service_role;
create or replace function public.reserve_voice_demo(p_visitor text) returns boolean
language plpgsql security definer set search_path=public as $$
declare g integer; v integer; day_end timestamptz;
begin
 if p_visitor is null or p_visitor !~ '^[a-f0-9]{64}$' then return false; end if;
 -- One transaction serializes both counters across all server instances.
 perform pg_advisory_xact_lock(hashtextextended('private_voice_demo',0));
 delete from voice_demo_limits where reset_at <= now();
 select attempts into g from voice_demo_limits where key='global';
 select attempts into v from voice_demo_limits where key='visitor:'||p_visitor;
 if coalesce(g,0)>=100 or coalesce(v,0)>=5 then return false; end if;
 day_end := (date_trunc('day',now() at time zone 'UTC') + interval '1 day') at time zone 'UTC';
 insert into voice_demo_limits values('global',1,day_end)
 on conflict(key) do update set attempts=voice_demo_limits.attempts+1;
 insert into voice_demo_limits values('visitor:'||p_visitor,1,now()+interval '1 hour')
 on conflict(key) do update set attempts=voice_demo_limits.attempts+1;
 return true;
end $$;
revoke all on function public.reserve_voice_demo(text) from public,anon,authenticated;
grant execute on function public.reserve_voice_demo(text) to service_role;
commit;
