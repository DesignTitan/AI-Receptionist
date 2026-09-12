import test from 'node:test';
import assert from 'node:assert/strict';
import { VoiceAudio } from '../src/components/marketing/voice-audio.ts';

test('mobile audio unlocks during the tap and requests the microphone only once', async () => {
  const calls: string[] = [];
  let resolveMic!: (stream: unknown) => void;
  const original = ['window', 'navigator', 'AudioContext'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  class Context {
    state = 'suspended';
    resume() { calls.push('resume'); this.state = 'running'; return Promise.resolve(); }
    close() { calls.push('close'); this.state = 'closed'; return Promise.resolve(); }
  }
  const track = { enabled: true, stop() { calls.push('stop-track'); } };
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: true } });
    Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: Context });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia() { calls.push('microphone'); return new Promise(resolve => { resolveMic = resolve; }); } } } });
    const audio = new VoiceAudio();
    assert.deepEqual(calls, ['resume', 'microphone']);
    resolveMic({ getTracks: () => [track], getAudioTracks: () => [track] });
    await audio.ready;
    audio.setMuted(true); assert.equal(track.enabled, false);
    audio.setMuted(false); assert.equal(track.enabled, true);
    audio.stop(); audio.stop();
    assert.equal(calls.filter(x => x === 'microphone').length, 1);
    assert.equal(calls.filter(x => x === 'stop-track').length, 1);
    const cancelled = new VoiceAudio(); cancelled.stop();
    resolveMic({ getTracks: () => [track] });
    await assert.rejects(cancelled.ready, /cancelled/);
    assert.equal(calls.filter(x => x === 'stop-track').length, 2);
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: false } });
    assert.throws(() => new VoiceAudio(), /requires HTTPS/);
  } finally {
    for (const [key, descriptor] of original) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
