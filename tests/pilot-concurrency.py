"""Run against the disposable local PostgreSQL database after all migrations."""
import concurrent.futures, subprocess, uuid
PSQL=['/opt/homebrew/opt/postgresql@17/bin/psql','-h','/private/tmp','-p','55439','-d','platform_final','-v','ON_ERROR_STOP=1','-At']
def sql(query):
    return subprocess.check_output(PSQL+['-c',query],text=True).strip()
fixtures=[(str(uuid.uuid4()),str(uuid.uuid4())) for _ in range(11)]
assert sql('select count(*) from pilot_setup_slots where customer_id is not null or redeemed')=='0', 'Use an empty disposable database'
try:
    for c,u in fixtures:
        sql(f"insert into auth.users(id) values('{u}'); insert into customers(id,owner_id,owner_email,business_name,slug,plan,config) values('{c}','{u}','test@example.test','Concurrent pilot test','test-{c}','front','{{}}');")
    def claim(pair):
        c,u=pair
        return int(sql(f"select (claim_pilot_checkout('{c}','{u}','price_pilot','price_standard')).setup_fee_cents"))
    with concurrent.futures.ThreadPoolExecutor(max_workers=11) as pool:
        prices=list(pool.map(claim,fixtures))
    assert prices.count(29900)==10 and prices.count(49900)==1,prices
    print('11 simultaneous checkouts: exactly 10 pilot prices and 1 standard price; no oversubscription.')
finally:
    for c,u in fixtures:
        sql(f"delete from customers where id='{c}'; delete from auth.users where id='{u}';")
