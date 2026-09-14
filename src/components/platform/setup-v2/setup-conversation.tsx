"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ANSWERING_PREFERENCES, type AnsweringPreference } from "@/lib/platform/answering-preference";
import { applyAnswer, interviewProgress, nextStep, normalizePhone, promptFor, TRADE_LABELS, type BusinessLookup, type InterviewAnswers, type Prompt, type StepId, type Trade } from "@/lib/platform/setup-interview";
import { resumeMessage } from "@/lib/platform/setup-journey";
import { formatTime, parseTimeText, timeOptions } from "@/lib/platform/time-text";
import { DAY_NAMES, minuteTime, timeMinutes, type DayHours } from "@/lib/platform/weekly-hours";
import styles from "./setup-v2.module.css";

export const V2_DRAFT_KEY = "receptionist-setup-v2-draft";

type Line = { id: number; who: "bubs" | "you"; text: string };
type Saved = { answers: InterviewAnswers };

let lineId = 0;
const line = (who: Line["who"], text: string): Line => ({ id: ++lineId, who, text });

/**
 * Version 2 setup: Bubs interviews the owner and the front-desk card fills
 * itself. Text only for now; the voice session plugs into the same script.
 * Everything Bubs learns is editable on the card, so the conversation is a
 * faster way in, never a gate.
 */
export function SetupConversation({ onChange, onDone }: { onChange?: (a: InterviewAnswers) => void; onDone?: () => void } = {}) {
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"" | "lookup">("");
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Answers persist; the transcript doesn't. Someone coming back gets one line
  // that proves Bubs remembers them, then the next question (or the way on).
  useEffect(() => {
    let saved: Saved | undefined;
    try { const raw = localStorage.getItem(V2_DRAFT_KEY); if (raw) saved = JSON.parse(raw) as Saved; } catch {}
    const a = saved?.answers ?? {};
    const step = nextStep(a);
    lineId = 0;
    if (Object.keys(a).length) {
      setAnswers(a);
      const p = promptFor(step, a);
      setPrompt(p);
      setLines(step === "done" ? [line("bubs", resumeMessage(a, true))] : [line("bubs", resumeMessage(a, false)), line("bubs", p.text)]);
    } else {
      const first = promptFor("phone", {});
      setLines([line("bubs", first.text)]);
      setPrompt(first);
    }
    setLoaded(true);
  }, []);

  // Autosave with the same "Saving…" feel as the current form.
  useEffect(() => {
    if (!loaded) return;
    setStatus("Saving…");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(V2_DRAFT_KEY, JSON.stringify({ answers } satisfies Saved)); setStatus("Saved on this device"); }
      catch { setStatus("Not saved — this browser blocks storage"); }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [answers, loaded]);

  // First paint lands at the latest message without motion; only later messages glide.
  const painted = useRef(false);
  useEffect(() => {
    const el = log.current;
    if (!el || !loaded) return;
    // Wait a frame so the panel has its final height (it takes it from the card) before measuring scrollHeight.
    const frame = requestAnimationFrame(() => { el.scrollTo({ top: el.scrollHeight, behavior: painted.current ? "smooth" : "instant" }); painted.current = true; });
    return () => cancelAnimationFrame(frame);
  }, [lines, busy, loaded]);
  useEffect(() => { if (loaded) onChange?.(answers); }, [answers, loaded, onChange]);

  /** Focus only moves to the chat when the answer came from the chat; card edits keep the user's cursor where it is. */
  function ask(a: InterviewAnswers, extra: Line[] = [], focus = true) {
    const step = nextStep(a);
    const p = promptFor(step, a);
    setPrompt(p);
    setLines(l => [...l, ...extra, line("bubs", p.text)]);
    if (focus) setTimeout(() => input.current?.focus({ preventScroll: true }), 0);
  }

  async function answer(raw: string, label = raw) {
    if (!prompt || busy) return;
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

  /** Edits on the card update the answers and, if it changes what to ask next, the conversation follows without taking focus. */
  function edit(patch: Partial<InterviewAnswers>) {
    const next = { ...answers, ...patch };
    if (typeof next.phone === "string" && next.phone) next.phone = normalizePhone(next.phone) ?? next.phone;
    setAnswers(next);
    const step = nextStep(next);
    if (prompt && step !== prompt.id) ask(next, [line("you", "(updated on the card)")], false);
  }

  function restart() {
    try { localStorage.removeItem(V2_DRAFT_KEY); } catch {}
    lineId = 0;
    const first = promptFor("phone", {});
    setAnswers({}); setLines([line("bubs", first.text)]); setPrompt(first); setDraft("");
  }

  const progress = interviewProgress(answers);
  const done = prompt?.id === "done";
  const showText = prompt && (prompt.input === "text" || prompt.input === "phone" || prompt.allowText);

  return <div className={styles.layout} data-loaded={loaded}>
    <aside className={styles.card} aria-label="What Bubs knows">
      <header className={styles.cardHead}>
        <div><h2>What Bubs knows</h2><p>Fills in as you talk. Change anything here. <button type="button" className={styles.linkish} onClick={restart}>Start over</button></p></div>
        <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Setup progress" style={{ "--p": progress } as React.CSSProperties}><span>{Math.round(progress * 100)}%</span></div>
      </header>
      <p className={styles.status} role="status">{status === "Saving…" && <span className={styles.spinner} aria-hidden="true" />}{status}</p>

      <Field label="Business phone" value={answers.phone ?? ""} placeholder="(313) 555-0142" onChange={v => edit({ phone: v || undefined })} />
      <Field label="Business name" value={answers.businessName ?? ""} placeholder="Willow Studio" onChange={v => edit({ businessName: v || undefined })} />
      <SelectField label="Business type" value={answers.trade ?? ""} onChange={v => edit({ trade: (v || undefined) as Trade | undefined })} options={[["", "Not answered yet"], ...(Object.keys(TRADE_LABELS) as Trade[]).map(t => [t, TRADE_LABELS[t]] as [string, string])]} />
      {answers.trade === "other" && <Field label="What you do" value={answers.customTrade ?? ""} placeholder="Dog grooming" onChange={v => edit({ customTrade: v || undefined })} />}
      <Field label="Address" value={answers.address ?? ""} placeholder="123 Example Street, Detroit, MI" onChange={v => edit({ address: v || undefined })} />
      <HoursField value={answers.weeklyHours} onChange={weeklyHours => edit({ weeklyHours, hoursPreset: "custom" })} />
      <SelectField label="Typical appointment" value={answers.minutes ? String(answers.minutes) : ""} onChange={v => edit({ minutes: v ? Number(v) : undefined })} options={[["", "Not answered yet"], ...[15, 30, 45, 60, 90, 120].map(n => [String(n), `${n} minutes`] as [string, string])]} />
      <SelectField label="When Bubs answers" value={answers.answering ?? ""} onChange={v => edit({ answering: (v || undefined) as AnsweringPreference | undefined })} options={[["", "Not answered yet"], ...(Object.keys(ANSWERING_PREFERENCES) as AnsweringPreference[]).filter(k => k !== "undecided").map(k => [k, ANSWERING_PREFERENCES[k].label] as [string, string])]} />

      {answers.lookup?.website && <p className={styles.note}>Listing website: <a href={answers.lookup.website} target="_blank" rel="noreferrer">{answers.lookup.website.replace(/^https?:\/\//, "")}</a></p>}
      {answers.lookup === null && answers.phone && <p className={styles.note}>No Google listing matched this number, so Bubs asked instead.</p>}
    </aside>
    <div className={styles.chatWrap}><section className={styles.chat} aria-label="Setup conversation with Bubs">
      <div ref={log} className={styles.log} role="log" aria-live="polite">
        {lines.map(l => <div key={l.id} className={styles.line} data-who={l.who}>
          {l.who === "bubs" && <Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} />}
          <p className={styles.bubble}>{l.text}</p>
        </div>)}
        {busy === "lookup" && <div className={styles.line} data-who="bubs"><Image src="/marketing/happy-mascot-pointed.png" alt="" width={36} height={36} className={styles.avatar} /><p className={`${styles.bubble} ${styles.thinking}`}><span className={styles.spinner} aria-hidden="true" />Checking that number for a listing…</p></div>}
      </div>
      {prompt && !done && <form className={styles.composer} onSubmit={e => { e.preventDefault(); if (draft.trim()) void answer(draft); }}>
        {prompt.input === "chips" && <div className={styles.chips} role="group" aria-label="Quick answers">
          {prompt.chips!.map(c => <button key={c.value} type="button" className={styles.chip} disabled={Boolean(busy)} onClick={() => void answer(c.value, c.label)}>{c.label}</button>)}
        </div>}
        {(showText || prompt.input === "chips") && <div className={styles.inputRow}>
          <input ref={input} value={draft} onChange={e => setDraft(e.target.value)} disabled={Boolean(busy)} inputMode={prompt.input === "phone" ? "tel" : undefined} autoComplete="off" placeholder={prompt.placeholder ?? (prompt.input === "chips" ? "Or type your answer" : "Type your answer")} aria-label="Your answer" />
          <button type="submit" className={styles.send} disabled={Boolean(busy) || !draft.trim()}>Send</button>
        </div>}
      </form>}
      {done && <div className={styles.done}>
        <p><strong>That’s everything.</strong> Next, preview your front desk: your greeting, your booking page, your hours.</p>
        <div className={styles.doneActions}>
          {onDone ? <button type="button" className={styles.primary} onClick={onDone}>Continue: Preview your front desk →</button> : <Link className={styles.primary} href="/account?preview=confirmation">Compare with the current setup →</Link>}
          <button type="button" className={styles.secondary} onClick={restart}>Start over</button>
        </div>
      </div>}
    </section></div>

  </div>;
}

async function lookup(phone: string): Promise<BusinessLookup | null> {
  try {
    const r = await fetch("/api/setup/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    if (!r.ok) return null;
    const data = (await r.json()) as { found?: boolean; lookup?: BusinessLookup | null };
    return data.found && data.lookup ? data.lookup : null;
  } catch { return null; }
}

/** Text fields buffer locally and commit on blur or Enter, so a half-typed value never re-routes the conversation mid-keystroke. */
function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);
  useEffect(() => { setDraft(value); dirty.current = false; }, [value]);
  // Only a value the user typed here may overwrite what Bubs recorded; a blur with no typing is a no-op.
  const commit = () => { if (dirty.current && draft !== value) onChange(draft); dirty.current = false; };
  return <label className={styles.fieldbox}><span>{label}</span><input value={draft} placeholder={placeholder} onChange={e => { dirty.current = true; setDraft(e.target.value); }} onBlur={commit} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit(); } }} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return <label className={styles.fieldbox}><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
}

function HoursField({ value, onChange }: { value?: DayHours[]; onChange: (v: DayHours[]) => void }) {
  const hours = value ?? Array.from({ length: 7 }, (_, day) => ({ day, enabled: false, opens: "09:00", closes: "17:00" }));
  const open = hours.find(d => d.enabled);
  const set = (patch: (d: DayHours) => DayHours) => onChange(hours.map(patch));
  return <div className={styles.fieldbox} data-hours>
    <span>Hours</span>
    <div className={styles.days} role="group" aria-label="Open days">
      {hours.map(d => <button key={d.day} type="button" className={styles.day} aria-pressed={d.enabled} onClick={() => set(x => x.day === d.day ? { ...x, enabled: !x.enabled } : x)}>{DAY_NAMES[d.day].slice(0, 3)}</button>)}
    </div>
    <div className={styles.times}>
      <TimeCombo label="Opens" value={open?.opens ?? "09:00"} min={0} max={timeMinutes(open?.closes ?? "17:00") - 15} onChange={t => set(x => ({ ...x, opens: t }))} />
      <TimeCombo label="Closes" value={open?.closes ?? "17:00"} min={timeMinutes(open?.opens ?? "09:00") + 15} max={1440} assumePm onChange={t => set(x => ({ ...x, closes: t }))} />
    </div>
    {!value && <small>Not answered yet</small>}
  </div>;
}

/**
 * A time you can type ("9", "9:30", "5 pm") or pick. Plain text field, no
 * icon: the list opens when the field has focus and narrows as you type.
 */
function TimeCombo({ label, value, min, max, assumePm = false, onChange }: { label: string; value: string; min: number; max: number; assumePm?: boolean; onChange: (time: string) => void }) {
  const id = useId();
  const current = timeMinutes(value);
  const [text, setText] = useState(formatTime(current));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [error, setError] = useState("");
  const dirty = useRef(false);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => { setText(formatTime(current)); dirty.current = false; setError(""); }, [current]);
  const digits = text.replace(/[^0-9]/g, "");
  // While typing, prefer whole-hour matches ("10" → 10:00, 10:15…, never 1:00); only if no hour starts with the digits fall back to h+mm ("93" → 9:30).
  const all = timeOptions(min, max);
  const hourOf = (n: number) => String(Math.floor(n / 60) % 12 || 12);
  const byHour = digits ? all.filter(n => hourOf(n).startsWith(digits)) : all;
  const options = !dirty.current || !digits ? all : byHour.length ? byHour : all.filter(n => (hourOf(n) + String(n % 60).padStart(2, "0")).startsWith(digits));
  function pick(n: number) { onChange(minuteTime(n)); setText(formatTime(n)); setError(""); setOpen(false); setActive(null); dirty.current = false; }
  function commit() {
    if (!dirty.current) { setOpen(false); return; }
    const n = parseTimeText(text, assumePm);
    if (n === null || n < min || n > max) { setError(`Use a time between ${formatTime(min)} and ${formatTime(max)}.`); return; }
    pick(Math.round(n / 15) * 15);
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter") { e.preventDefault(); if (open && active !== null) pick(active); else commit(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); setOpen(true);
      const i = active === null ? options.indexOf(current) : options.indexOf(active);
      const next = options[Math.max(0, Math.min(options.length - 1, (i < 0 ? 0 : i) + (e.key === "ArrowDown" ? 1 : -1)))];
      if (next !== undefined) { setActive(next); list.current?.querySelector(`[data-n="${next}"]`)?.scrollIntoView({ block: "nearest" }); }
    }
  }
  useEffect(() => { if (open) requestAnimationFrame(() => list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" })); }, [open]);
  return <label className={styles.timeCombo}>{label}
    <input id={id} value={text} role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={open && active !== null ? `${id}-${active}` : undefined} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-err` : undefined} autoComplete="off" spellCheck={false} inputMode="numeric"
      onFocus={e => { e.currentTarget.select(); setOpen(true); }} onChange={e => { dirty.current = true; setText(e.target.value); setActive(null); setError(""); setOpen(true); }} onBlur={() => { setTimeout(() => { setOpen(false); commit(); }, 120); }} onKeyDown={onKeyDown} />
    <ul id={`${id}-list`} ref={list} role="listbox" aria-label={`${label} times`} className={styles.timeList} hidden={!open || !options.length}>
      {options.map(n => <li key={n} id={`${id}-${n}`} data-n={n} role="option" aria-selected={n === (active ?? current)} className={styles.timeOption} onPointerDown={e => e.preventDefault()} onClick={() => pick(n)} onPointerMove={() => setActive(n)}>{formatTime(n)}</li>)}
    </ul>
    {error && <small id={`${id}-err`} className={styles.timeError}>{error}</small>}
  </label>;
}

export type { StepId };
