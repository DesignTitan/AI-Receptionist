// Read-only readiness check. Never print credentials, tokens or account records.
import {createClient} from '@supabase/supabase-js';
const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','AUTH_SESSION_ENCRYPTION_KEY'];
let failed=false;
for(const name of required){const present=Boolean(process.env[name]);console.log(`${present?'OK':'MISSING'} ${name}`);if(!present)failed=true;}
if(process.env.AUTH_SESSION_ENCRYPTION_KEY&&!/^[a-f0-9]{64}$/i.test(process.env.AUTH_SESSION_ENCRYPTION_KEY)){console.log('INVALID AUTH_SESSION_ENCRYPTION_KEY: expected 64 hex characters');failed=true;}
if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY){
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 for(const table of ['account_security','account_sessions','account_recovery_codes','account_recovery_requests','account_auth_limits','account_security_events']){const {error}=await client.from(table).select('*',{head:true}).limit(0);console.log(`${error?'UNAVAILABLE':'OK'} ${table}`);if(error)failed=true;}
}
console.log(`Passkeys: ${process.env.AUTH_PASSKEYS_ENABLED==='true'?'enabled in app; verify provider RP configuration separately':'disabled until provider configuration is verified'}`);
console.log('Live email, TOTP, passkey and two-browser revocation acceptance must be completed before release.');
process.exitCode=failed?1:0;
