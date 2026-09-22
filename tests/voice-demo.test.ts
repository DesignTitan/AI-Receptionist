import { createHmac } from "node:crypto";
import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST, __resetVoiceDemoStateForTests } from '../src/lib/voice-demo-session.ts';

test('voice practice is gated and never accepts caller-supplied agent configuration', async () => {
  const before = { ...process.env };
  const originalFetch = globalThis.fetch;
  const url = 'http://127.0.0.1:3101/api/voice-demo/session';
  const request = (origin = 'http://127.0.0.1:3101') => new Request(url, { method: 'POST', headers: { origin }, body: JSON.stringify({ agent_id: 666, custom_variables: { script: 'override' } }) });
  try {
    Object.assign(process.env, { NODE_ENV: 'development', OMNIDIMENSION_API_KEY: '', OMNIDIMENSION_DEMO_AGENT_ID: '' });
    assert.deepEqual(await (await GET(new Request(url))).json(), { available: false });
    assert.equal((await POST(request())).status, 503);
    Object.assign(process.env, { OMNIDIMENSION_API_KEY: 'test-only', OMNIDIMENSION_DEMO_AGENT_ID: '123', OMNIDIMENSION_AGENT_ID: '123' });
    assert.equal((await POST(request())).status, 503);
    process.env.OMNIDIMENSION_DEMO_AGENT_ID = '456';
    assert.equal((await POST(request('https://elsewhere.example'))).status, 403);
    assert.deepEqual(await (await GET(new Request('https://example.com/api/voice-demo/session'))).json(), { available: false });
    Object.assign(process.env, { NODE_ENV: 'production' });
    assert.equal((await POST(request())).status, 503);
    Object.assign(process.env, { NODE_ENV: 'development' });
    let calls = 0;
    globalThis.fetch = async (input, options) => {
      calls++;
      assert.equal(input, 'https://backend.omnidim.io/api/v1/sessions/create');
      assert.deepEqual(JSON.parse(String(options?.body)), { agent_id: 456, type: 'voice', metadata: { source: 'local_marketing_practice' } });
      return Response.json({ ws_url: 'wss://live.omnidim.io/chat/start_voice_chat?request_token=test', token: 'not-returned', session_id: 1 });
    };
    const response = await POST(new Request('http://localhost:3101/api/voice-demo/session', { method: 'POST', headers: { host: '127.0.0.1:3101', origin: 'http://127.0.0.1:3101' } }));
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { wsUrl: 'wss://live.omnidim.io/chat/start_voice_chat?request_token=test' });
    globalThis.fetch = async () => Response.json({ ws_url: 'wss://unexpected.example/test' });
    assert.equal((await POST(request())).status, 502);
    globalThis.fetch = async () => { throw Error('secret must never reach client'); };
    const failed = await POST(request());
    assert.equal(failed.status, 502);
    assert.ok(!(await failed.text()).includes('secret'));
    await POST(request()); await POST(request());
    assert.equal((await POST(request())).status, 429);
    assert.equal(calls, 1);
    __resetVoiceDemoStateForTests();
    globalThis.fetch = async () => Response.json({ error: 'insufficient_balance' }, { status: 402 });
    const balance = await POST(request());
    assert.equal(balance.status, 503);
    assert.match(String((await balance.json()).error), /out of credits/i);
    assert.deepEqual(await (await GET(new Request(url))).json(), { available: true });
  } finally {
    __resetVoiceDemoStateForTests();
    globalThis.fetch = originalFetch;
    for (const name of Object.keys(process.env)) if (!(name in before)) delete process.env[name];
    Object.assign(process.env, before);
  }
});


test('hosted tester voice requires a signed password cookie and durable reservation', async () => {
 const before = {...process.env}; const originalFetch = globalThis.fetch;
 try {
  Object.assign(process.env, {NODE_ENV:'production', VOICE_DEMO_ENABLED:'true', SITE_GATE:'locked', SITE_PASSWORD:'test-secret', OMNIDIMENSION_API_KEY:'test-key', OMNIDIMENSION_DEMO_AGENT_ID:'456', OMNIDIMENSION_AGENT_ID:'123', NEXT_PUBLIC_SUPABASE_URL:'https://db.example', SUPABASE_SERVICE_ROLE_KEY:'test-db'});
  const url='https://bubs.ai/api/voice-demo/session';
  const expiry=String(Date.now()+60000);
  const cookie='ai_receptionist_site='+expiry+'.'+createHmac('sha256','test-secret').update(expiry).digest('hex');
  const req=(value=cookie)=>new Request(url,{method:'POST',headers:{origin:'https://bubs.ai',cookie:value}});
  assert.deepEqual(await (await GET(new Request(url))).json(),{available:false});
  assert.equal((await POST(req('ai_receptionist_site=forged'))).status,503);
  assert.deepEqual(await (await GET(req())).json(),{available:true});
  let providerCalls=0;
  globalThis.fetch=async(input)=>{ if(String(input).includes('/rpc/'))return Response.json(false);providerCalls++;return Response.json({}); };
  assert.equal((await POST(req())).status,429);assert.equal(providerCalls,0);
  globalThis.fetch=async()=>Response.json({}, {status:500});
  assert.equal((await POST(req())).status,503);
  globalThis.fetch=async(input)=>{if(String(input).includes('/rpc/'))return Response.json(true);providerCalls++;return Response.json({ws_url:'wss://live.omnidim.io/test'});};
  assert.equal((await POST(req())).status,200);assert.equal(providerCalls,1);
  process.env.SITE_GATE='public';assert.deepEqual(await (await GET(req())).json(),{available:false});
 } finally {globalThis.fetch=originalFetch;for(const name of Object.keys(process.env))if(!(name in before))delete process.env[name];Object.assign(process.env,before);}
});
