"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./setup-v2.module.css";

type Business = { name: string; trade?: string; hours?: string; minutes?: number };
type Suggest = { configured: boolean; suggestions?: string[]; error?: string };
type Review = { configured: boolean; feedback?: string; revised?: string; keepAsIs?: boolean; error?: string };

/**
 * One call script the owner can read, edit, or replace. "Suggest" asks Bubs
 * for three rewrites; once they've edited, "Review" gives one line of feedback
 * and a revised version they can accept or dismiss. Nothing changes unless
 * they click Use.
 */
export function ScriptEditor({ kind, label, generated, custom, business, onChange }: {
  kind: "incoming" | "outgoing";
  label: string;
  generated: string;
  custom: string | undefined;
  business: Business;
  onChange: (custom: string | undefined) => void;
}) {
  const value = custom ?? generated;
  const [text, setText] = useState(value);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState<"" | "suggest" | "review">("");
  const [note, setNote] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setText(value); }, [value]);
  useEffect(() => { const el = area.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; } }, [text]);

  const edited = text.trim() !== generated.trim();
  const dirty = text !== value;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  function commit(next = text) {
    const trimmed = next.trim();
    onChange(trimmed && trimmed !== generated.trim() ? trimmed : undefined);
  }

  async function ask<T>(mode: "suggest" | "review"): Promise<T | null> {
    setBusy(mode); setNote("");
    try {
      const r = await fetch("/api/setup/script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, kind, script: text, business }) });
      const data = (await r.json()) as T & { configured?: boolean; error?: string };
      if (!r.ok) { setNote("That didn’t work. Try again."); return null; }
      if (data.configured === false) { setNote("Suggestions need an ANTHROPIC_API_KEY on this server; nothing is generated without one."); return null; }
      if (data.error) { setNote(data.error); return null; }
      return data;
    } catch { setNote("That didn’t work. Try again."); return null; }
    finally { setBusy(""); }
  }

  return <div className={styles.script}>
    <label className={styles.scriptLabel}>{label}
      <textarea ref={area} value={text} rows={3} maxLength={1200} spellCheck onChange={e => { setText(e.target.value); setReview(null); }} onBlur={() => { if (dirty) commit(); }} />
    </label>
    <div className={styles.scriptMeta}>
      <span>{words} words{words > 40 ? " · long for a call" : ""}{edited ? " · your wording" : " · written from your answers"}</span>
      {edited && <button type="button" className={styles.linkish} onClick={() => { setText(generated); commit(generated); setReview(null); setSuggestions(null); }}>Use the original</button>}
    </div>
    <div className={styles.scriptActions}>
      <button type="button" className={styles.secondary} disabled={Boolean(busy)} onClick={async () => { const d = await ask<Suggest>("suggest"); if (d?.suggestions) setSuggestions(d.suggestions); }}>{busy === "suggest" ? "Thinking…" : "Suggest other versions"}</button>
      {edited && <button type="button" className={styles.secondary} disabled={Boolean(busy)} onClick={async () => { if (dirty) commit(); const d = await ask<Review>("review"); if (d) setReview(d); }}>{busy === "review" ? "Reading…" : "Ask Bubs™ for feedback"}</button>}
    </div>
    {note && <p className={styles.note} role="status">{note}</p>}
    {suggestions && <ul className={styles.suggestions} aria-label="Suggested versions">
      {suggestions.map((s, i) => <li key={i}><p>{s}</p><button type="button" className={styles.chip} onClick={() => { setText(s); commit(s); setSuggestions(null); setReview(null); }}>Use this</button></li>)}
      <li className={styles.suggestionsFoot}><button type="button" className={styles.linkish} onClick={() => setSuggestions(null)}>Keep mine</button></li>
    </ul>}
    {review && <div className={styles.review} role="status">
      <p><strong>Bubs™:</strong> {review.feedback}</p>
      {!review.keepAsIs && review.revised && review.revised.trim() !== text.trim() && <>
        <blockquote>{review.revised}</blockquote>
        <div className={styles.scriptActions}>
          <button type="button" className={styles.primary} onClick={() => { setText(review.revised!); commit(review.revised!); setReview(null); }}>Accept</button>
          <button type="button" className={styles.secondary} onClick={() => setReview(null)}>Keep mine</button>
        </div>
      </>}
      {review.keepAsIs && <button type="button" className={styles.secondary} onClick={() => setReview(null)}>Got it</button>}
    </div>}
  </div>;
}
