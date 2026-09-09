"""Check shared inbound/outbound capacity in an explicitly chosen disposable local DB.

Apply all migrations first. Connection arguments can come from --host/--port/
--database/--user or PGHOST/PGPORT/PGDATABASE/PGUSER. Example:
    python3 tests/inbound-concurrency.py --host /tmp --port 5433 \
        --database inbound_test --disposable

No network service, payment or telephone provider is contacted. Only random test
customers are created; their rows are removed in finally, even after an assertion.
"""

import argparse
import concurrent.futures
import json
import os
import shutil
import subprocess
import threading
import uuid


def options():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--psql", default=os.environ.get("PSQL", "psql"))
    parser.add_argument("--host", default=os.environ.get("PGHOST"))
    parser.add_argument("--port", default=os.environ.get("PGPORT"), type=int)
    parser.add_argument("--database", default=os.environ.get("PGDATABASE"))
    parser.add_argument("--user", default=os.environ.get("PGUSER"))
    parser.add_argument("--rounds", type=int, default=8)
    parser.add_argument("--disposable", action="store_true",
                        help="Confirm this explicitly selected local database is disposable.")
    args = parser.parse_args()
    if not args.disposable or not args.host or not args.port or not args.database:
        parser.error("Supply a local host, port, database, and --disposable; there are no database defaults.")
    if "," in args.host or (args.host not in ("127.0.0.1", "::1", "localhost") and not os.path.isabs(args.host)):
        parser.error("Only a loopback host or an absolute local Unix socket directory is allowed.")
    if not 1 <= args.port <= 65535 or not 1 <= args.rounds <= 50:
        parser.error("Port must be 1–65535 and rounds must be 1–50.")
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
    # A service or hostaddr must never override the explicit local connection.
    for key in ("PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE", "PGOPTIONS"):
        environment.pop(key, None)
    environment["PGCONNECT_TIMEOUT"] = "5"
    environment["PGOPTIONS"] = "-c statement_timeout=15000 -c lock_timeout=10000"

    def sql(query):
        return subprocess.check_output(command + ["--command", query], text=True,
                                       env=environment, timeout=25).strip()

    customer, owner = str(uuid.uuid4()), str(uuid.uuid4())
    config = json.dumps({"timezone": "UTC", "days": list(range(7)), "opens": "09:00",
                         "closes": "17:00", "team": [{"id": "member-1", "name": "Fixture",
                         "service": "Test appointment", "minutes": 30}]})
    try:
        sql(f"""begin;
            insert into auth.users(id) values('{owner}');
            insert into customers(id,owner_id,owner_email,business_name,slug,plan,status,billing_status,config,phone_settings)
            values('{customer}','{owner}','concurrency@example.test','Inbound concurrency fixture',
                'inbound-concurrency-{customer}','front','live','active','{config}','{{"inboundEnabled":true,"confirmationCalls":true}}');
            insert into customer_phone_connections(customer_id,provider,inbound_number,ai_number,agent_id,secret_hash,status,verified_at)
            values('{customer}','omnidimension','+12125550190','+12125550191','fixture-{customer}',repeat('a',64),'ready',now());
            select sync_usage_period('{customer}',date_trunc('day',now()),date_trunc('day',now())+interval '1 month','front');
            commit;""")

        for round_number in range(args.rounds):
            booking = str(uuid.uuid4())
            call = sql(f"select (register_customer_inbound_call('{customer}','fixture-{uuid.uuid4()}','+12125550101')).id")
            sql(f"""begin;
                update usage_periods set used_minutes=included_minutes-5,reserved_minutes=0 where customer_id='{customer}';
                insert into customer_bookings(id,customer_id,provider_id,full_name,phone,starts_at,ends_at)
                values('{booking}','{customer}','fixture-{round_number}','Concurrent outgoing fixture','+12125550102',
                    now()+interval '2 days',now()+interval '2 days 30 minutes');
                commit;""")
            barrier = threading.Barrier(2)

            def reserve(direction):
                barrier.wait(timeout=5)
                function, record = ("reserve_inbound_call_usage", call) if direction == "inbound" else ("reserve_call_usage", booking)
                return direction, sql(f"select {function}('{customer}','{record}')")

            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                results = dict(pool.map(reserve, ("inbound", "outbound")))
            assert sorted(results.values()) == ["f", "t"], f"Round {round_number + 1}: {results}"
            assert sql(f"select used_minutes||'|'||reserved_minutes from usage_periods where customer_id='{customer}'") == "295|5", results
            assert sql(f"""select
                (select count(*) from inbound_call_usage u join customer_calls c on c.id=u.call_id where c.customer_id='{customer}' and u.settled_at is null)+
                (select count(*) from call_usage u join customer_bookings b on b.id=u.booking_id where b.customer_id='{customer}' and u.settled_at is null)""") == "1", results

            winner = next(direction for direction, allowed in results.items() if allowed == "t")
            if winner == "inbound":
                settle = f"record_customer_inbound_call('{customer}','{call}','completed','Fixture without booking',null,null,61,null)"
                reserve_again = f"reserve_inbound_call_usage('{customer}','{call}')"
            else:
                settle = f"settle_call_usage('{customer}','{booking}',61,null)"
                reserve_again = f"reserve_call_usage('{customer}','{booking}')"
            assert sql(f"select {settle}") == "t", winner
            assert sql(f"select {settle}") == "t", "Settlement replay should be accepted without recharging."
            assert sql(f"select {reserve_again}") == "f", "Settled call was reserved twice."
            assert sql(f"select used_minutes||'|'||reserved_minutes from usage_periods where customer_id='{customer}'") == "297|0", "Shared allowance or replay accounting is wrong."

        print(f"{args.rounds} simultaneous inbound/outbound pairs: exactly one five-minute reservation each; settlement replay charged once.")
    finally:
        sql(f"""begin;
            delete from inbound_call_usage where call_id in(select id from customer_calls where customer_id='{customer}');
            delete from call_usage where booking_id in(select id from customer_bookings where customer_id='{customer}');
            delete from customer_calls where customer_id='{customer}';
            delete from customer_bookings where customer_id='{customer}';
            delete from customer_phone_connections where customer_id='{customer}';
            delete from customers where id='{customer}';
            delete from auth.users where id='{owner}';
            commit;""")


if __name__ == "__main__":
    main()
