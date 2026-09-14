"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ANSWERING_PREFERENCES, type AnsweringPreference } from "@/lib/platform/answering-preference";
import { ANSWERING_CHIPS, answeringHint, interviewProgress, TRADE_LABELS, type InterviewAnswers, type Prompt, type Trade } from "@/lib/platform/setup-interview";
import { formatTime, parseTimeText, timeOptions } from "@/lib/platform/time-text";
import { DAY_NAMES, minuteTime, timeMinutes, type DayHours } from "@/lib/platform/weekly-hours";
import styles from "./setup-v2.module.css";

/** What Bubs knows: every answer, editable, with the way on at the bottom once it's complete. */
export function SetupCard({ answers, prompt, status, onEdit, onRestart, onDone }: { answers: InterviewAnswers; prompt: Prompt | null; status: string; onEdit: (patch: Partial<InterviewAnswers>) => void; onRestart: () => void; onDone: () => void }) {
  const progress = interviewProgress(answers);
  const done = prompt?.id === "done";
  const edit = onEdit;
  return <aside className={styles.card} aria-label="What Bubs knows">
      <header className={styles.cardHead}>
        <div><h2>What Bubs™ knows</h2><p>Fills in as you talk. Change anything here. <button type="button" className={styles.linkish} onClick={onRestart}>Start over</button></p></div>
        <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Setup progress" style={{ "--p": progress } as React.CSSProperties}><span>{Math.round(progress * 100)}%</span></div>
      </header>
      <p className={styles.status} role="status">{status === "Saving…" && <span className={styles.spinner} aria-hidden="true" />}{status}</p>

      <Field label="Business phone" value={answers.phone ?? ""} placeholder="(313) 555-0142" onChange={v => edit({ phone: v || undefined })} />
      <Field label="Business name" value={answers.businessName ?? ""} placeholder="Willow Studio" onChange={v => edit({ businessName: v || undefined })} />
      <SelectField label="Business type" value={answers.trade ?? ""} onChange={v => edit({ trade: (v || undefined) as Trade | undefined })} options={[["", "Not answered yet"], ...(Object.keys(TRADE_LABELS) as Trade[]).map(t => [t, TRADE_LABELS[t]] as [string, string])]} />
      {answers.trade === "other" && <Field label="What you do" value={answers.customTrade ?? ""} placeholder="Dog grooming" onChange={v => edit({ customTrade: v || undefined })} />}
      <Field label="Address" value={answers.address ?? ""} placeholder="123 Example Street, Detroit, MI" onChange={v => edit({ address: v || undefined })} />
      <HoursField value={answers.weeklyHours} onChange={weeklyHours => edit({ weeklyHours, hoursPreset: "custom" })} />
      <SelectField label="Appointment length" value={answers.minutes ? String(answers.minutes) : ""} onChange={v => edit({ minutes: v ? Number(v) : undefined })} options={[["", "Not answered yet"], ...[15, 30, 45, 60, 90, 120].map(n => [String(n), `${n} minutes`] as [string, string])]} />
      <SelectField label="When Bubs™ answers the phone" value={answers.answering ?? ""} onChange={v => edit({ answering: (v || undefined) as AnsweringPreference | undefined })} options={[["", "Not answered yet"], ...ANSWERING_CHIPS.map(c => [c.value, c.label] as [string, string]), ...(Object.keys(ANSWERING_PREFERENCES) as AnsweringPreference[]).filter(k => k !== "undecided" && !ANSWERING_CHIPS.some(c => c.value === k)).map(k => [k, ANSWERING_PREFERENCES[k].label] as [string, string])]} hint={answeringHint(answers.answering) ?? (answers.answering ? ANSWERING_PREFERENCES[answers.answering]?.description : undefined)} />

      {done && prompt && <footer className={styles.cardFoot} role="status">
        <p><Image src="/marketing/happy-mascot-pointed.png" alt="" width={28} height={28} className={styles.avatar} />{prompt.text}</p>
        <div className={styles.doneActions}>
          <button type="button" className={styles.primary} onClick={onDone}>Continue: Preview your front desk →</button>
          <button type="button" className={styles.secondary} onClick={onRestart}>Start over</button>
        </div>
      </footer>}
      {answers.lookup?.website && <p className={styles.note}>Listing website: <a href={answers.lookup.website} target="_blank" rel="noreferrer">{answers.lookup.website.replace(/^https?:\/\//, "")}</a></p>}
      {answers.lookup === null && answers.phone && <p className={styles.note}>No Google listing matched this number, so Bubs™ asked instead.</p>}
    </aside>;
}

/** Text fields buffer locally and commit on blur or Enter, so a half-typed value never re-routes the conversation mid-keystroke. */
function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);
  useEffect(() => { setDraft(value); dirty.current = false; }, [value]);
  // Only a value the user typed here may overwrite what Bubs recorded; a blur with no typing is a no-op.
  const commit = () => { if (dirty.current && draft !== value) onChange(draft); dirty.current = false; };
  return <label className={styles.fieldbox}><span>{label}</span><input value={draft} placeholder={placeholder ?? " "} onChange={e => { dirty.current = true; setDraft(e.target.value); }} onBlur={commit} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit(); } }} /></label>;
}

function SelectField({ label, value, options, hint, onChange }: { label: string; value: string; options: [string, string][]; hint?: string; onChange: (v: string) => void }) {
  return <div className={styles.selectWrap}><label className={styles.fieldbox}><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>{hint && <small className={styles.fieldHint}>{hint}</small>}</div>;
}

function HoursField({ value, onChange }: { value?: DayHours[]; onChange: (v: DayHours[]) => void }) {
  const hours = value ?? Array.from({ length: 7 }, (_, day) => ({ day, enabled: false, opens: "09:00", closes: "17:00" }));
  const open = hours.find(d => d.enabled);
  const set = (patch: (d: DayHours) => DayHours) => onChange(hours.map(patch));
  return <div className={styles.fieldbox} data-hours>
    <span>Business hours</span>
    <div className={styles.days} role="group" aria-label="Open days">
      {hours.map(d => <button key={d.day} type="button" className={styles.day} aria-pressed={d.enabled} onClick={() => set(x => x.day === d.day ? { ...x, enabled: !x.enabled } : x)}>{DAY_NAMES[d.day].slice(0, 3)}</button>)}
    </div>
    <div className={styles.times}>
      <TimeCombo label="Opens" value={open?.opens ?? "09:00"} min={0} max={timeMinutes(open?.closes ?? "17:00") - 15} onChange={t => set(x => ({ ...x, opens: t }))} />
      <TimeCombo label="Closes" value={open?.closes ?? "17:00"} min={timeMinutes(open?.opens ?? "09:00") + 15} max={1440} assumePm onChange={t => set(x => ({ ...x, closes: t }))} />
    </div>
    <small>{value ? "When customers can book. When Bubs™ answers the phone is set separately below." : "Not answered yet"}</small>
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

