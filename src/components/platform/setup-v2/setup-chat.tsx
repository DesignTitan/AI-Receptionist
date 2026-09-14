"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { applyCommand, applyExtractedPatch, guideMessage, heuristicExtract, isQuestion, localHelp, missingFields } from "@/lib/platform/setup-help";
import type { WebSession } from "@omnidim-ai/client";
import { VoiceAudio } from "@/components/marketing/voice-audio";
import { applyAnswer, nextStep, normalizePhone, promptFor, TRADE_LABELS, type BusinessLookup, type InterviewAnswers, type Prompt } from "@/lib/platform/setup-interview";
import { spokenHours } from "@/lib/platform/setup-journey";
import styles from "./setup-v2.module.css";

export const V2_DRAFT_KEY = "receptionist-setup-v2-draft";

type Line = { id: number; who: "bubs" | "you"; text: string };
export type Stage = "talk" | "hear";

/**
 * Bubs beside the work, from the first question through the preview. One
 * transcript, one input. Step 1 asks the interview questions; from then on
 * Bubs guides, applies plain requests to the card, and answers questions.
 */
export function useSetupChat(answers: InterviewAnswers, setAnswers: (a: InterviewAnswers) => void, stage: Stage, loaded: boolean) {
  const [lines, setLines] = useState<Line[]>([]);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"" | "lookup" | "help">("");
  const [voice, setVoice] = useState<"off" | "unavailable" | "connecting" | "active" | "ended">("off");
  const [voiceNote, setVoiceNote] = useState("");
  const [caption, setCaption] = useState("");
  const [muted, setMuted] = useState(false);
  const session = useRef<WebSession | null>(null);
  const audio = useRef<VoiceAudio | null>(null);
  const lastAgentLine = useRef("");
  const answersRef = useRef(answers); answersRef.current = answers;
  const promptRef = useRef(prompt); promptRef.current = prompt;
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const opened = useRef(false);
  const lastStage = useRef<Stage>(stage);
  const line = (who: Line["who"], text: string): Line => ({ id: ++nextId.current, who, text });

  // Opening: what Bubs already has, then the next question if there is one.
  useEffect(() => {
    if (!loaded || opened.current) return;
    opened.current = true;
    const step = nextStep(answers);
    const p = promptFor(step, answers);
    setPrompt(p);
    if (Object.keys(answers).length) setLines(step === "done" ? [line("bubs", guideMessage(answers))] : [line("bubs", guideMessage(answers)), line("bubs", p.text)]);
    else setLines([line("bubs", p.text)]);
    if (stage === "hear") setLines(l => [...l, line("bubs", previewIntro(answers))]);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Moving between steps: Bubs says where we are, once.
  useEffect(() => {
    if (!loaded || lastStage.current === stage) return;
    lastStage.current = stage;
    if (stage === "hear") setLines(l => [...l, line("bubs", previewIntro(answers))]);
    else setLines(l => [...l, line("bubs", "Back to your details. Change anything on the card, or ask me.")]);
  }, [stage, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded) return;
    fetch("/api/setup/voice-session", { cache: "no-store" }).then(r => r.json()).then(d => setVoice(d.available ? "off" : "unavailable")).catch(() => setVoice("unavailable"));
    const leave = () => { session.current?.stop(); audio.current?.stop(); };
    window.addEventListener("pagehide", leave);
    return () => { window.removeEventListener("pagehide", leave); leave(); };
  }, [loaded]);

  const painted = useRef(false);
  useEffect(() => {
    const el = log.current;
    if (!el || !loaded) return;
    const frame = requestAnimationFrame(() => { el.scrollTo({ top: el.scrollHeight, behavior: painted.current ? "smooth" : "instant" }); painted.current = true; });
    return () => cancelAnimationFrame(frame);
  }, [lines, busy, loaded]);

  function ask(a: InterviewAnswers, extra: Line[] = [], focus = true) {
    const step = nextStep(a);
    const p = promptFor(step, a);
    setPrompt(p);
    setLines(l => [...l, ...extra, line("bubs", p.text)]);
    if (focus) setTimeout(() => input.current?.focus({ preventScroll: true }), 0);
  }

  async function help(question: string) {
    setLines(l => [...l, line("you", question)]);
    setBusy("help");
    let reply = "";
    try {
      const card = { phone: answers.phone ?? null, businessName: answers.businessName ?? null, trade: answers.trade ?? null, customTrade: answers.customTrade ?? null, address: answers.address ?? null, minutes: answers.minutes ?? null, answering: answers.answering ?? null, greeting: answers.greeting ?? null, confirmation: answers.confirmation ?? null, stage };
      const r = await fetch("/api/setup/help", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, card, missing: missingFields(answers) }) });
      const data = (await r.json()) as { configured?: boolean; answer?: string };
      if (r.ok && data.configured && data.answer) reply = data.answer;
    } catch {}
    setBusy("");
    setLines(l => [...l, line("bubs", reply || localHelp(question, answers, stage))]);
    setDraft("");
  }

  function applied(raw: string, cmd: { answers: InterviewAnswers; reply: string }) {
    setLines(l => [...l, line("you", raw), line("bubs", cmd.reply)]);
    setDraft("");
    if (cmd.answers === answers || !prompt) return;
    setAnswers(cmd.answers);
    const step = nextStep(cmd.answers);
    if (step !== prompt.id && step !== "done") ask(cmd.answers, [], false);
    else if (step === "done" && prompt.id !== "done") setPrompt(promptFor("done", cmd.answers));
  }

  async function submit(raw: string, label = raw) {
    if (!prompt || busy) return;
    const interviewing = stage === "talk" && prompt.id !== "done";
    if (!interviewing || isQuestion(raw)) {
      const cmd = applyCommand(raw, answers);
      if (cmd) { applied(raw, cmd); return; }
      void help(raw); return;
    }
    if (prompt.input === "chips" || prompt.input === "phone") {
      const cmd = applyCommand(raw, answers);
      if (cmd && cmd.answers !== answers) { applied(raw, cmd); return; }
    }
    const result = applyAnswer(prompt.id, raw, answers);
    const spoken = line("you", label);
    if (result.error) { setLines(l => [...l, spoken, line("bubs", result.error!)]); setDraft(""); return; }
    setDraft("");
    let next = result.answers;
    setAnswers(next);
    const replies = result.reply ? [line("bubs", result.reply)] : [];
    if (prompt.id === "phone") {
      setLines(l => [...l, spoken]);
      setBusy("lookup");
      next = { ...next, lookup: await lookup(next.phone!) };
      setBusy("");
      setAnswers(next);
      ask(next, replies);
      return;
    }
    setLines(l => [...l, spoken]);
    ask(next, replies);
  }

  /** Edits made on the card. If they change what to ask next, the conversation follows without taking focus. */
  function edit(patch: Partial<InterviewAnswers>) {
    const next = { ...answers, ...patch };
    if (typeof next.phone === "string" && next.phone) next.phone = normalizePhone(next.phone) ?? next.phone;
    setAnswers(next);
    const step = nextStep(next);
    if (prompt && step !== prompt.id && stage === "talk") ask(next, [line("you", "(updated on the card)")], false);
    else if (prompt && step !== prompt.id) setPrompt(promptFor(step, next));
  }

  function restart() {
    try { localStorage.removeItem(V2_DRAFT_KEY); } catch {}
    nextId.current = 0;
    const first = promptFor("phone", {});
    setAnswers({}); setLines([line("bubs", first.text)]); setPrompt(first); setDraft("");
  }

  /** What the owner said, spoken → card. Claude when configured; the local parsers otherwise. Nothing is guessed. */
  async function absorb(said: string) {
    const a = answersRef.current;
    const p = promptRef.current;
    let next = a;
    try {
      const known = { phone: a.phone, businessName: a.businessName, trade: a.trade, address: a.address, minutes: a.minutes, answering: a.answering };
      const r = await fetch("/api/setup/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ said, asked: lastAgentLine.current, known }) });
      const data = (await r.json()) as { configured?: boolean; patch?: Parameters<typeof applyExtractedPatch>[1] | null };
      if (r.ok && data.configured && data.patch) next = applyExtractedPatch(a, data.patch);
      else next = heuristicExtract(said, a, p?.id ?? "");
    } catch { next = heuristicExtract(said, a, p?.id ?? ""); }
    if (next !== a) {
      setAnswers(next);
      const step = nextStep(next);
      if (p && step !== p.id) setPrompt(promptFor(step, next));
    }
  }

  function stopVoice(reason: "ended" | "off" = "ended") {
    session.current?.stop(); session.current = null;
    audio.current?.stop(); audio.current = null;
    setCaption(""); setMuted(false);
    setVoice(v => v === "unavailable" ? v : reason);
  }

  async function startVoice() {
    if (voice === "connecting" || voice === "active" || voice === "unavailable") return;
    setVoiceNote(""); setVoice("connecting");
    let current: WebSession | null = null; let engine: VoiceAudio | null = null;
    try {
      const a = answersRef.current;
      const knownBits = [a.phone && `phone ${a.phone}`, a.businessName && `name ${a.businessName}`, a.trade && `type ${a.trade === "other" ? a.customTrade ?? "other" : TRADE_LABELS[a.trade]}`, a.address && `address ${a.address}`, a.weeklyHours?.some(d => d.enabled) && `hours ${spokenHours(a.weeklyHours)}`, a.minutes && `appointments ${a.minutes} minutes`, a.answering && `answering ${a.answering}`].filter(Boolean) as string[];
      const known = knownBits.length ? knownBits.join("; ") : "nothing yet";
      const missing = missingFields(a).join(", ") || "nothing";
      const step = nextStep(a);
      const spoken: Record<string, string> = { phone: "What’s your business phone number, the one customers already call?", answering: "When should I answer the phone: every call, only after hours, when your team can’t pick up, or let callers choose?" };
      const firstQuestion = step === "done" ? "Everything’s on the card already. Is there anything you’d like to change?" : spoken[step] ?? promptFor(step, a).text.replace(/^Last one\.\s*/, "");
      const r = await fetch("/api/setup/voice-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ known, missing, firstQuestion }), signal: AbortSignal.timeout(15_000) });
      const data = await r.json();
      if (!r.ok) throw new Error(typeof data.error === "string" ? data.error : "Voice couldn’t connect.");
      // Only now touch the microphone: the session is ours, so a mic problem is the only thing left that can fail.
      engine = new VoiceAudio(micId || undefined); audio.current = engine;
      await engine.ready;
      void listMics();
      const { WebSession: Session } = await import("@omnidim-ai/client");
      current = new Session({ audioEngine: engine }); session.current = current;
      current.on("status", value => {
        if (typeof value === "object") { stopVoice("ended"); setLines(l => [...l, line("bubs", "Voice ended. Keep going here by typing, or start voice again.")]); }
        else setVoice(value);
      });
      current.on("transcript", value => {
        if (!value.final) { setCaption(value.role === "user" ? value.text : ""); return; }
        setCaption("");
        if (!value.text.trim()) return;
        if (value.role === "agent") { lastAgentLine.current = value.text; setLines(l => [...l, line("bubs", value.text)]); }
        else { setLines(l => [...l, line("you", value.text)]); void absorb(value.text); }
      });
      current.on("error", () => { stopVoice("ended"); setVoiceNote("The voice connection dropped. You can keep typing, or start voice again."); });
      await current.start({ wsUrl: data.wsUrl });
    } catch (reason) {
      current?.stop(); engine?.stop(); session.current = null; audio.current = null;
      setVoice("off");
      const message = reason instanceof Error ? reason.message : "";
      setVoiceNote(/permission|NotAllowed|denied/i.test(message) ? "Microphone access was blocked. Allow it in the browser, or keep typing." : message || "Voice couldn’t connect. You can keep typing.");
    }
  }

  function toggleMute() { const m = !muted; session.current?.mute(m); setMuted(m); }

  const [micTest, setMicTest] = useState<{ state: "idle" | "testing" | "ok" | "silent" | "blocked" | "none" | "changed"; device?: string }>({ state: "idle" });
  const [level, setLevel] = useState(0);
  const MIC_KEY = "receptionist-setup-mic";
  const [mics, setMics] = useState<Array<{ id: string; label: string }>>([]);
  const [micId, setMicId] = useState<string>(() => { try { return localStorage.getItem(MIC_KEY) ?? ""; } catch { return ""; } });
  function chooseMic(id: string) {
    setMicId(id);
    try { if (id) localStorage.setItem(MIC_KEY, id); else localStorage.removeItem(MIC_KEY); } catch {}
    // A different microphone has to prove itself before Bubs uses it.
    setMicTest({ state: "changed", device: mics.find(m => m.id === id)?.label ?? "Default microphone" });
  }
  async function listMics() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const inputs = all.filter(d => d.kind === "audioinput" && d.label && !/^Default -|Virtual/.test(d.label)).map(d => ({ id: d.deviceId, label: d.label }));
      setMics(inputs);
      if (micId && !inputs.some(m => m.id === micId)) chooseMic("");
    } catch {}
  }
  // If the site already has permission, show the device names before any test.
  useEffect(() => { if (loaded) void listMics(); }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const currentMicLabel = mics.find(m => m.id === micId)?.label ?? (mics.length ? "Default microphone" : "");

  /** Listens until it hears you (up to ten seconds), showing the level as it goes. No session, no cost. */
  async function testMic() {
    setMicTest({ state: "testing" }); setLevel(0);
    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) { setMicTest({ state: "none" }); return; }
      stream = await navigator.mediaDevices.getUserMedia({ audio: micId ? { deviceId: { exact: micId } } : true });
      const device = stream.getAudioTracks()[0]?.label || "Default microphone";
      void listMics();
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser(); analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let hits = 0;
      const until = Date.now() + 10_000;
      while (Date.now() < until) {
        analyser.getByteTimeDomainData(buf);
        let peak = 0; for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        setLevel(Math.min(1, peak / 40));
        if (peak > 8) hits++; else hits = Math.max(0, hits - 1);
        if (hits >= 3) { await ctx.close(); setMicTest({ state: "ok", device }); setLevel(0); return; }
        await new Promise(r => setTimeout(r, 60));
      }
      await ctx.close();
      setMicTest({ state: "silent", device }); setLevel(0);
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      setMicTest({ state: name === "NotFoundError" ? "none" : "blocked" }); setLevel(0);
    } finally { stream?.getTracks().forEach(t => t.stop()); }
  }

  return { lines, prompt, draft, setDraft, busy, submit, edit, restart, log, input, stage, voice, voiceNote, caption, muted, startVoice, stopVoice, toggleMute, micTest, testMic, mics, micId, chooseMic, currentMicLabel, level };
}

export type SetupChat = ReturnType<typeof useSetupChat>;

function previewIntro(a: InterviewAnswers): string {
  return `This is what callers${a.businessName ? ` to ${a.businessName}` : ""} will get. Read the greeting and the confirmation call out loud; if either doesn’t sound like you, change the words, ask me for other versions, or tell me what to change.`;
}

export function ChatPanel({ chat }: { chat: SetupChat }) {
  const { lines, prompt, draft, setDraft, busy, submit, log, input, stage, voice, voiceNote, caption, muted, startVoice, stopVoice, toggleMute, micTest, testMic, mics, micId, chooseMic, currentMicLabel, level } = chat;
  const talking = voice === "connecting" || voice === "active";
  const interviewing = stage === "talk" && prompt?.id !== "done";
  const placeholder = !interviewing ? (stage === "hear" ? "Ask about the greeting, the confirmation call or the booking page" : "Ask about any field on the card") : prompt?.placeholder ?? (prompt?.input === "chips" ? "Or type your answer, or ask a question" : "Type your answer, or ask a question");
  const micText = {
    idle: "",
    testing: "Say something out loud…",
    ok: "All set. Want a different microphone? Pick it on the right and test again.",
    silent: `Heard nothing from “${micTest.device}”. Make sure your microphone is set up: pick the one you’re speaking into on the right, then test again.`,
    changed: `Switched to “${micTest.device}”. Test again to make sure it works.`,
    blocked: "Chrome blocked the microphone for this site. Click the lock icon in the address bar → Microphone → Allow, then test again.",
    none: "No microphone found by the browser. Plug one in or connect your headphones, then test again.",
  }[micTest.state];
  const needsRetest = micTest.state === "silent" || micTest.state === "changed" || micTest.state === "blocked" || micTest.state === "none";
  const attention = micTest.state === "silent" || micTest.state === "none";
  return <div className={styles.chatWrap}><section className={styles.chat} aria-label="Setup conversation with Bubs">
    <div ref={log} className={styles.log} role="log" aria-live="polite">
      {lines.map(l => <div key={l.id} className={styles.line} data-who={l.who}>
        {l.who === "bubs" && <Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} />}
        <p className={styles.bubble}>{l.text}</p>
      </div>)}
      {busy && <div className={styles.line} data-who="bubs"><Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} /><p className={`${styles.bubble} ${styles.thinking}`}><span className={styles.spinner} aria-hidden="true" />{busy === "lookup" ? "Checking that number for a listing…" : "Thinking…"}</p></div>}
      {caption && <div className={styles.line} data-who="you"><p className={`${styles.bubble} ${styles.caption}`}>{caption}</p></div>}
    </div>
    <div className={styles.voiceBar} data-state={voice}>
      {talking ? <>
        <span className={styles.voiceDot} aria-hidden="true" /><span className={styles.voiceStatus} role="status">{voice === "connecting" ? "Connecting…" : muted ? "Muted" : "Bubs™ is listening"}</span>
        <button type="button" className={styles.secondary} onClick={toggleMute} disabled={voice !== "active"} aria-pressed={muted}>{muted ? "Unmute" : "Mute"}</button>
        <button type="button" className={styles.secondary} onClick={() => stopVoice("ended")}>End voice</button>
      </> : <>
        <button type="button" className={styles.micTestBtn} data-state={micTest.state} data-retest={needsRetest || undefined} onClick={testMic} disabled={micTest.state === "testing"}>
          {micTest.state === "ok" ? "✓ All set" : micTest.state === "testing" ? "Listening…" : needsRetest ? "Test again" : "Test microphone"}
          {micTest.state === "testing" && <span className={styles.level} aria-hidden="true"><i style={{ transform: `scaleX(${level})` }} /></span>}
        </button>
        {mics.length > 0 && <label className={styles.micPick} data-attention={attention || undefined} title="Change microphone">
          <span className={styles.micName}>{currentMicLabel}</span><span aria-hidden="true">▾</span>
          <select aria-label="Microphone" value={micId} onChange={e => chooseMic(e.target.value)}><option value="">Default microphone</option>{mics.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
        </label>}
        <button type="button" className={styles.primary} onClick={startVoice} disabled={voice === "unavailable" || micTest.state !== "ok"} title={micTest.state !== "ok" ? "Test your microphone first" : undefined}>{voice === "ended" ? "Talk to Bubs™ again" : "Talk to Bubs™"}</button>
        <span className={styles.voiceStatus} role="status">{micText || (voice === "unavailable" ? "Voice isn’t connected in this build; typing works." : "Test your microphone, then talk to Bubs™. Or just type below.")}</span>
      </>}
    </div>
    {voiceNote && <p className={styles.voiceNote} role="alert">{voiceNote}</p>}
    {prompt && <form className={styles.composer} onSubmit={e => { e.preventDefault(); if (draft.trim()) void submit(draft); }}>
      {interviewing && prompt.input === "chips" && <div className={prompt.chips!.some(c => c.hint) ? styles.optionList : styles.chips} role="group" aria-label="Quick answers">
        {prompt.chips!.map(c => <button key={c.value} type="button" className={c.hint ? styles.optionCard : styles.chip} disabled={Boolean(busy)} onClick={() => void submit(c.value, c.label)}>{c.hint ? <><strong>{c.label}</strong><span>{c.hint}</span></> : c.label}</button>)}
      </div>}
      <div className={styles.inputRow}>
        <input ref={input} value={draft} onChange={e => setDraft(e.target.value)} disabled={Boolean(busy)} inputMode={interviewing && prompt.input === "phone" ? "tel" : undefined} autoComplete="off" placeholder={placeholder} aria-label={interviewing ? "Your answer" : "Ask Bubs a question"} />
        <button type="submit" className={styles.send} disabled={Boolean(busy) || !draft.trim()}>Send</button>
      </div>
    </form>}
  </section></div>;
}

async function lookup(phone: string): Promise<BusinessLookup | null> {
  try {
    const r = await fetch("/api/setup/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    if (!r.ok) return null;
    const data = (await r.json()) as { found?: boolean; lookup?: BusinessLookup | null };
    return data.found && data.lookup ? data.lookup : null;
  } catch { return null; }
}

