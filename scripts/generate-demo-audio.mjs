/**
 * Generates public/demo/sample-call.wav — the placeholder recording the demo
 * provider attaches to simulated calls, so the dashboard's audio player has
 * something real to play.
 *
 * It is synthesised, not recorded: telephone-band (8 kHz) tones shaped by a
 * syllable envelope, alternating between two "speakers". Swap the file for a
 * real recording whenever you connect a live voice provider.
 *
 *   node scripts/generate-demo-audio.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 8000;
const DURATION = 46;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "demo", "sample-call.wav");

/** Alternating turns: [start, end, pitch] in seconds / hertz. */
const TURNS = [
  [0.4, 5.0, 196],
  [5.4, 6.6, 128],
  [7.0, 13.5, 196],
  [13.9, 15.4, 128],
  [15.8, 24.0, 196],
  [24.4, 26.6, 128],
  [27.0, 35.0, 196],
  [35.4, 37.2, 128],
  [37.6, 44.4, 196],
];

const samples = new Int16Array(SAMPLE_RATE * DURATION);
let phase = 0;

for (let i = 0; i < samples.length; i++) {
  const t = i / SAMPLE_RATE;
  const turn = TURNS.find(([start, end]) => t >= start && t < end);
  if (!turn) continue;

  const [start, end, pitch] = turn;
  // Syllable rate ~4.2 Hz, plus a slower phrase envelope and edge fades.
  const syllable = Math.max(0, Math.sin(2 * Math.PI * 4.2 * t)) ** 1.4;
  const phrase = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.35 * t + start);
  const fade = Math.min(1, (t - start) / 0.12, (end - t) / 0.18);
  const envelope = syllable * phrase * Math.max(0, fade);

  // Wobbling fundamental with two harmonics standing in for formants.
  const f = pitch * (1 + 0.06 * Math.sin(2 * Math.PI * 1.7 * t));
  phase += (2 * Math.PI * f) / SAMPLE_RATE;
  const voice =
    Math.sin(phase) * 0.55 +
    Math.sin(phase * 2) * 0.22 +
    Math.sin(phase * 3.1) * 0.12 +
    (Math.random() * 2 - 1) * 0.05;

  samples[i] = Math.round(voice * envelope * 7200);
}

const header = Buffer.alloc(44);
const dataBytes = samples.length * 2;
header.write("RIFF", 0);
header.writeUInt32LE(36 + dataBytes, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(dataBytes, 40);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, Buffer.from(samples.buffer)]));
console.log(`Wrote ${OUT} (${(dataBytes / 1024).toFixed(0)} KB, ${DURATION}s)`);
