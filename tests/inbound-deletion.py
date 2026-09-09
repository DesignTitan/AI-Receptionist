"""Exercise the real deletion script in an explicitly selected disposable local DB.

Apply all migrations first, then supply --host, --port, --database and
--disposable (or PGHOST/PGPORT/PGDATABASE plus --disposable). --repo-root selects
the checkout when running this test from staging. The deletion script is read,
never changed on disk. Every created test row is removed in finally.
"""

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import uuid


def options():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--psql", default=os.environ.get("PSQL", "psql"))
    parser.add_argument("--host", default=os.environ.get("PGHOST"))
    parser.add_argument("--port", default=os.environ.get("PGPORT"), type=int)
    parser.add_argument("--database", default=os.environ.get("PGDATABASE"))
    parser.add_argument("--user", default=os.environ.get("PGUSER"))
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--disposable", action="store_true")
    args = parser.parse_args()
    if not args.disposable or not args.host or not args.port or not args.database:
        parser.error("Supply a local host, port, database, and --disposable; there are no database defaults.")
    if "," in args.host or (args.host not in ("127.0.0.1", "::1", "localhost") and not os.path.isabs(args.host)):
        parser.error("Only a loopback host or an absolute local Unix socket directory is allowed.")
    if not 1 <= args.port <= 65535:
        parser.error("Port must be 1–65535.")
    if "://" in args.database or "=" in args.database or args.database in ("postgres", "template0", "template1"):
        parser.error("Use a plain disposable database name, not a connection string or system database.")
    if not shutil.which(args.psql):
        parser.error("psql was not found; supply --psql with its executable path.")
    return args


def main():
    args = options()
    command = [args.psql, "--no-psqlrc", "--quiet", "--tuples-only", "--no-align",
               "--set", "ON_ERROR_STOP=1", "--host", args.host, "--port", str(args.port),
               "--dbname", args.database]
    if args.user:
        command += ["--username", args.user]
    environment = os.environ.copy()
    for key in ("PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE", "PGOPTIONS"):
        environment.pop(key, None)
    environment["PGCONNECT_TIMEOUT"] = "5"
    environment["PGOPTIONS"] = "-c statement_timeout=15000 -c lock_timeout=10000"

    def sql(query):
        return subprocess.check_output(command, input=query, text=True,
                                       env=environment, timeout=25).strip()

    target, other, owner, other_owner = [str(uuid.uuid4()) for _ in range(4)]
    receipt = "fixture-inbound-deletion-" + str(uuid.uuid4())
    source_path = args.repo_root / "supabase" / "delete-customer-data.sql"
    source = source_path.read_text()
    placeholder = "'00000000-0000-0000-0000-000000000000'"
    assert source.count(placeholder) == 1, "Expected exactly one safe deletion target placeholder."
    deletion, commits = re.subn(r"(?im)^rollback;\s*$", "commit;", source.replace(placeholder, f"'{target}'"))
    assert commits == 1, "Expected exactly one final ROLLBACK in the operator script."
    pilot_slot = None

    def snapshot(customer):
        return json.loads(sql(f"""select jsonb_build_object(
            'customer',(select to_jsonb(c) from customers c where id='{customer}'),
            'bookings',(select jsonb_agg(to_jsonb(b) order by id) from customer_bookings b where customer_id='{customer}'),
            'calls',(select jsonb_agg(to_jsonb(c) order by id) from customer_calls c where customer_id='{customer}'),
            'connections',(select jsonb_agg(to_jsonb(p) order by customer_id) from customer_phone_connections p where customer_id='{customer}'),
            'periods',(select jsonb_agg(to_jsonb(p) order by id) from usage_periods p where customer_id='{customer}'),
            'inbound_usage',(select jsonb_agg(to_jsonb(u) order by call_id) from inbound_call_usage u where call_id in(select id from customer_calls where customer_id='{customer}')),
            'outbound_usage',(select jsonb_agg(to_jsonb(u) order by booking_id) from call_usage u where booking_id in(select id from customer_bookings where customer_id='{customer}')),
            'jobs',(select jsonb_agg(to_jsonb(j) order by id) from customer_jobs j where customer_id='{customer}'),
            'notices',(select jsonb_agg(to_jsonb(n) order by id) from usage_notices n where customer_id='{customer}')
        );"""))

    try:
        sql(f"""begin;
            insert into auth.users(id) values('{owner}'),('{other_owner}');
            do $$ declare c uuid; incoming customer_calls; booked customer_bookings; outbound customer_bookings;
                booking_time timestamptz:=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')+interval '2 days 10 hours';
            begin
                foreach c in array array['{target}'::uuid,'{other}'::uuid] loop
                    insert into customers(id,owner_id,owner_email,business_name,slug,plan,status,billing_status,config,phone_settings)
                    values(c,case when c='{target}' then '{owner}'::uuid else '{other_owner}'::uuid end,
                        'deletion@example.test','Deletion fixture','inbound-deletion-'||c,'front','live','active',
                        '{{"timezone":"UTC","days":[0,1,2,3,4,5,6],"opens":"09:00","closes":"17:00","team":[{{"id":"member-1","name":"Fixture","service":"Fixture appointment","minutes":30}}]}}',
                        '{{"inboundEnabled":true,"confirmationCalls":true}}');
                    insert into customer_phone_connections(customer_id,provider,inbound_number,ai_number,agent_id,secret_hash,status,verified_at)
                    values(c,'omnidimension',case when c='{target}' then '+12125550170' else '+12125550172' end,
                        '+12125550171','fixture-'||c,repeat('a',64),'ready',now());
                    perform sync_usage_period(c,date_trunc('day',now()),date_trunc('day',now())+interval '1 month','front');
                    incoming:=register_customer_inbound_call(c,'deletion-'||c,'+12125550100');
                    if not reserve_inbound_call_usage(c,incoming.id) then raise exception 'Deletion fixture inbound reservation refused';end if;
                    booked:=reserve_customer_phone_booking(c,incoming.id,'delete-fixture','member-1','Phone fixture','+12125550100',null,booking_time,booking_time+interval '30 minutes');
                    if not record_customer_inbound_call(c,incoming.id,'booked','Deletion fixture',null,null,61,14.5) then raise exception 'Deletion fixture inbound settlement refused';end if;
                    outbound:=reserve_customer_booking(c,'member-1','Online fixture','+12125550101',null,booking_time+interval '1 hour',booking_time+interval '90 minutes');
                    if not reserve_call_usage(c,outbound.id) then raise exception 'Deletion fixture outbound reservation refused';end if;
                    if not settle_call_usage(c,outbound.id,61,14.5) then raise exception 'Deletion fixture outbound settlement refused';end if;
                end loop;
                perform pg_advisory_xact_lock(29949910);
                update pilot_setup_slots set customer_id='{target}',redeemed=true where slot=(
                    select slot from pilot_setup_slots where customer_id is null and not redeemed order by slot limit 1 for update);
                if not found then raise exception 'A free pilot place is required in this disposable test database';end if;
            end $$;
            update customers set billing_status='canceled',status='paused' where id='{target}';
            insert into stripe_events(id) values('{receipt}');
            commit;""")
        pilot_slot = int(sql(f"select slot from pilot_setup_slots where customer_id='{target}';"))
        before = snapshot(other)
        assert len(before["bookings"]) == 2 and len(before["inbound_usage"]) == 1 and len(before["outbound_usage"]) == 1, "Incomplete unrelated-business fixture."

        sql(deletion)

        assert all(value is None for value in snapshot(target).values()), "Deleted business still has customer, call, booking, usage, routing or job data."
        assert snapshot(other) == before, "Deletion changed the unrelated business."
        assert sql(f"select (customer_id is null)::text||'|'||redeemed::text from pilot_setup_slots where slot={pilot_slot};") == "true|true", "Paid pilot place was released for resale."
        assert sql(f"select count(*) from stripe_events where id='{receipt}';") == "1", "Stripe receipt was deleted."
        assert sql(f"select count(*) from auth.users where id in('{owner}','{other_owner}');") == "2", "Operator deletion unexpectedly removed auth accounts."
        assert source_path.read_text() == source, "The operator deletion script changed on disk."
        print("Deletion smoke passed: phone-booking cycle and both usage ledgers removed; unrelated business, paid pilot place, Stripe receipt and auth accounts preserved.")
    finally:
        # These two UUIDs and this receipt were created by this invocation only.
        sql(f"""begin;
            delete from customer_jobs where customer_id in('{target}','{other}');
            delete from inbound_call_usage where call_id in(select id from customer_calls where customer_id in('{target}','{other}'));
            delete from call_usage where booking_id in(select id from customer_bookings where customer_id in('{target}','{other}'));
            update customer_calls set booking_id=null,booking_key=null where customer_id in('{target}','{other}');
            delete from customer_bookings where customer_id in('{target}','{other}');
            delete from customer_calls where customer_id in('{target}','{other}');
            delete from customer_phone_connections where customer_id in('{target}','{other}');
            update pilot_setup_slots set customer_id=null,redeemed=false where customer_id='{target}';
            delete from customers where id in('{target}','{other}');
            delete from auth.users where id in('{owner}','{other_owner}');
            delete from stripe_events where id='{receipt}';
            commit;""")
        if pilot_slot is not None:
            sql(f"update pilot_setup_slots set redeemed=false where slot={pilot_slot} and customer_id is null;")


if __name__ == "__main__":
    main()
