"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { applyCommand, guideMessage, isQuestion, localHelp, missingFields } from "@/lib/platform/setup-help";
import { applyAnswer, nextStep, normalizePhone, promptFor, type BusinessLookup, type InterviewAnswers, type Prompt } from "@/lib/platform/setup-interview";
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

  return { lines, prompt, draft, setDraft, busy, submit, edit, restart, log, input, stage };
}

export type SetupChat = ReturnType<typeof useSetupChat>;

function previewIntro(a: InterviewAnswers): string {
  return `This is what callers${a.businessName ? ` to ${a.businessName}` : ""} will get. Read the greeting and the confirmation call out loud; if either doesn’t sound like you, change the words, ask me for other versions, or tell me what to change.`;
}

export function ChatPanel({ chat }: { chat: SetupChat }) {
  const { lines, prompt, draft, setDraft, busy, submit, log, input, stage } = chat;
  const interviewing = stage === "talk" && prompt?.id !== "done";
  const placeholder = !interviewing ? (stage === "hear" ? "Ask about the greeting, the confirmation call or the booking page" : "Ask about any field on the card") : prompt?.placeholder ?? (prompt?.input === "chips" ? "Or type your answer, or ask a question" : "Type your answer, or ask a question");
  return <div className={styles.chatWrap}><section className={styles.chat} aria-label="Setup conversation with Bubs">
    <div ref={log} className={styles.log} role="log" aria-live="polite">
      {lines.map(l => <div key={l.id} className={styles.line} data-who={l.who}>
        {l.who === "bubs" && <Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} />}
        <p className={styles.bubble}>{l.text}</p>
      </div>)}
      {busy && <div className={styles.line} data-who="bubs"><Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} /><p className={`${styles.bubble} ${styles.thinking}`}><span className={styles.spinner} aria-hidden="true" />{busy === "lookup" ? "Checking that number for a listing…" : "Thinking…"}</p></div>}
    </div>
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

