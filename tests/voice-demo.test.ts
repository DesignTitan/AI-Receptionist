import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST } from '../src/app/api/voice-demo/session/route.ts';

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
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of Object.keys(process.env)) if (!(name in before)) delete process.env[name];
    Object.assign(process.env, before);
  }
});
