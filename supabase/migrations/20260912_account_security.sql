begin;
-- Application access is granted only by trusted server ceremonies, never by a client JWT claim.
create table public.account_security (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enrolled boolean not null default false,
 recovery_session_id uuid,
 operation_id uuid,
 operation_until timestamptz,
 created_at timestamptz not null default now()
);
create table public.account_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique,
 provider_token text not null,
 approved_at timestamptz,
 recovery_only boolean not null default false,
 label text not null,
 destination text not null default '/account',
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz
);
create index account_sessions_user on public.account_sessions(user_id);
create table public.account_recovery_codes (
 user_id uuid not null references auth.users(id) on delete cascade,
 code_hash text not null,
 used_at timestamptz,
 primary key(user_id,code_hash)
);
create table public.account_recovery_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','reviewing','resolved','declined')),
 created_at timestamptz not null default now()
);
create unique index account_one_pending_recovery on public.account_recovery_requests(user_id) where status in ('pending','reviewing');
create table public.account_auth_limits (key text primary key, attempts integer not null, reset_at timestamptz not null);
create table public.account_security_events (
 id bigint generated always as identity primary key,
 user_id uuid references auth.users(id) on delete cascade,
 event text not null,
 created_at timestamptz not null default now()
);
alter table public.account_security enable row level security;
alter table public.account_sessions enable row level security;
alter table public.account_recovery_codes enable row level security;
alter table public.account_recovery_requests enable row level security;
alter table public.account_auth_limits enable row level security;
alter table public.account_security_events enable row level security;
revoke all on public.account_security,public.account_sessions,public.account_recovery_codes,public.account_recovery_requests,public.account_auth_limits,public.account_security_events from anon,authenticated;
grant all on public.account_security,public.account_sessions,public.account_recovery_codes,public.account_recovery_requests,public.account_auth_limits,public.account_security_events to service_role;
grant usage,select on sequence public.account_security_events_id_seq to service_role;
create function public.account_auth_limit(p_key text, p_max integer default 10) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into account_auth_limits(key,attempts,reset_at) values(p_key,1,now()+interval '10 minutes')
 on conflict(key) do update set attempts=case when account_auth_limits.reset_at<now() then 1 else account_auth_limits.attempts+1 end,
 reset_at=case when account_auth_limits.reset_at<now() then now()+interval '10 minutes' else account_auth_limits.reset_at end
 returning attempts into n;
 return n<=p_max;
end $$;
create function public.account_replace_recovery(p_user uuid,p_hashes text[]) returns void
language plpgsql security definer set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 if array_length(p_hashes,1)<>10 then raise exception 'Ten codes required';end if;
 delete from account_recovery_codes where user_id=p_user;
 insert into account_recovery_codes(user_id,code_hash) select p_user,unnest(p_hashes);
end $$;
create function public.account_use_recovery(p_user uuid,p_hash text,p_session uuid,p_new_hash text) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 if not exists(select 1 from account_sessions where id=p_session and user_id=p_user and revoked_at is null and expires_at>now()) then return false;end if;
 update account_recovery_codes set used_at=now() where user_id=p_user and code_hash=p_hash and used_at is null;
 get diagnostics n=row_count;
 if n<>1 then return false;end if;
 update account_security set recovery_session_id=p_session where user_id=p_user;
 update account_sessions set recovery_only=true,approved_at=now(),token_hash=p_new_hash where id=p_session;
 update account_sessions set revoked_at=now() where user_id=p_user and id<>p_session and revoked_at is null;
 insert into account_security_events(user_id,event) values(p_user,'recovery_code_used');
 return true;
end $$;
create function public.account_security_lock(p_user uuid,p_operation uuid) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 update account_security set operation_id=p_operation,operation_until=now()+interval '3 minutes'
 where user_id=p_user and (operation_until is null or operation_until<now());
 get diagnostics n=row_count;return n=1;
end $$;
create function public.account_security_unlock(p_user uuid,p_operation uuid) returns void
language sql security definer set search_path=public as $$
 update account_security set operation_id=null,operation_until=null where user_id=p_user and operation_id=p_operation;
$$;
revoke all on function public.account_security_lock(uuid,uuid),public.account_security_unlock(uuid,uuid) from public,anon,authenticated;
grant execute on function public.account_security_lock(uuid,uuid),public.account_security_unlock(uuid,uuid) to service_role;
revoke all on function public.account_auth_limit(text,integer),public.account_replace_recovery(uuid,text[]),public.account_use_recovery(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.account_auth_limit(text,integer),public.account_replace_recovery(uuid,text[]),public.account_use_recovery(uuid,text,uuid,text) to service_role;
commit;
