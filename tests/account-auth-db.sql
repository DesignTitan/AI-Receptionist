-- Run only against an isolated test database, after the account security migration.
begin;
insert into auth.users(id) values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
insert into account_security(user_id) values('00000000-0000-0000-0000-000000000001');
insert into account_sessions(id,user_id,token_hash,provider_token,label,expires_at) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','one','encrypted','Current',now()+interval '15 minutes'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','two','encrypted','Other',now()+interval '15 minutes'),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','three','encrypted','Other owner',now()+interval '15 minutes');
select account_replace_recovery('00000000-0000-0000-0000-000000000001',array['a','b','c','d','e','f','g','h','i','j']);
do $$
begin
 if has_table_privilege('anon','public.account_sessions','select') or has_table_privilege('authenticated','public.account_recovery_codes','select') then raise exception 'Private tables exposed';end if;
 if has_function_privilege('authenticated','public.account_use_recovery(uuid,text,uuid,text)','execute') then raise exception 'Recovery RPC exposed';end if;
 if account_use_recovery('00000000-0000-0000-0000-000000000001','a','10000000-0000-0000-0000-000000000003','rotated') then raise exception 'Cross-account recovery accepted';end if;
 if account_use_recovery('00000000-0000-0000-0000-000000000001','missing','10000000-0000-0000-0000-000000000001','rotated') then raise exception 'Invalid recovery accepted';end if;
 if not account_use_recovery('00000000-0000-0000-0000-000000000001','a','10000000-0000-0000-0000-000000000001','rotated') then raise exception 'Valid recovery rejected';end if;
 if account_use_recovery('00000000-0000-0000-0000-000000000001','a','10000000-0000-0000-0000-000000000001','rotated') then raise exception 'Recovery replay accepted';end if;
 if exists(select 1 from account_sessions where token_hash='one') or not exists(select 1 from account_sessions where token_hash='rotated') then raise exception 'Recovery cookie did not rotate';end if;
 if (select recovery_session_id from account_security where user_id='00000000-0000-0000-0000-000000000001')<>'10000000-0000-0000-0000-000000000001'::uuid then raise exception 'Recovery ownership missing';end if;
 if not(select recovery_only from account_sessions where token_hash='rotated') then raise exception 'Recovery must remain restricted';end if;
 if (select revoked_at from account_sessions where token_hash='two') is null then raise exception 'Other session still active';end if;
 if (select revoked_at from account_sessions where token_hash='three') is not null then raise exception 'Revoked another owner';end if;
 if account_use_recovery('00000000-0000-0000-0000-000000000001','b','10000000-0000-0000-0000-000000000002','rotated') then raise exception 'Revoked session accepted';end if;
 if not account_auth_limit('attempt',2) or not account_auth_limit('attempt',2) or account_auth_limit('attempt',2) then raise exception 'Rate limit failed';end if;
 if not account_security_lock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001') then raise exception 'Cannot acquire security lock';end if;
 if account_security_lock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002') then raise exception 'Concurrent mutation accepted';end if;
 perform account_security_unlock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002');
 if account_security_lock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002') then raise exception 'Foreign lock release accepted';end if;
 perform account_security_unlock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001');
 if not account_security_lock('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002') then raise exception 'Lock did not release';end if;
end $$;
select account_replace_recovery('00000000-0000-0000-0000-000000000001',array['k','l','m','n','o','p','q','r','s','t']);
do $$ begin
 if exists(select 1 from account_recovery_codes where code_hash='a') or (select count(*) from account_recovery_codes)<>10 then raise exception 'Code replacement failed';end if;
end $$;
rollback;
