"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { RoadmapItem, RoadmapSeed, Suggestion } from "@/lib/roadmap/types";
import "./roadmap-board.css";

type BoardResponse = { features: RoadmapItem[]; storage?: "local" | "supabase" };
type SuggestionResponse = { suggestion: Suggestion; message: string };
type VisibleItem = RoadmapSeed & {
  votes: number | null;
  hasVoted: boolean;
  source: "team" | "community";
};

const STATUS_LABELS = { planned: "Planned", pilot: "Pilot", exploring: "Exploring" };

class FeedbackRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new FeedbackRequestError(typeof data?.error === "string" ? data.error : "Feedback could not be saved or loaded. Please try again.", response.status);
  }
  return data as T;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && !["TypeError", "AbortError", "TimeoutError"].includes(error.name) ? error.message : fallback;
}

export function RoadmapBoard({ seeds }: { seeds: RoadmapSeed[] }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const mutationInFlight = useRef(false);
  const [features, setFeatures] = useState<RoadmapItem[] | null>(null);
  const [storage, setStorage] = useState<"local" | "supabase" | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [reload, setReload] = useState(0);
  const [sort, setSort] = useState<"roadmap" | "votes">("roadmap");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [received, setReceived] = useState<Suggestion | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    async function load() {
      try {
        const response = await fetch("/api/roadmap", { cache: "no-store", credentials: "same-origin", signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]) });
        const data = await readResponse<BoardResponse>(response);
        if (!Array.isArray(data.features)) throw new Error("The latest votes could not be loaded. Please try again.");
        if (abort.signal.aborted) return;
        setFeatures(data.features);
        setStorage(data.storage ?? null);
        setReady(true);
        setAnnouncement(reload ? "The latest votes are ready." : "");
      } catch (failure) {
        if (abort.signal.aborted) return;
        setReady(false);
        setError(errorMessage(failure, "We couldn’t load the latest votes. Please try again."));
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => abort.abort();
  }, [reload]);

  async function vote(item: VisibleItem) {
    if (!ready || loading || mutationInFlight.current) return;
    mutationInFlight.current = true;
    setPendingVote(item.id);
    setError("");
    setAnnouncement(`Saving your vote for ${item.title}…`);
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        credentials: "same-origin",
        signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", featureId: item.id, voted: !item.hasVoted }),
      });
      const data = await readResponse<BoardResponse>(response);
      if (!Array.isArray(data.features)) throw new Error("We couldn’t check whether your vote was saved. Reload the votes before trying again.");
      setFeatures(data.features);
      const saved = data.features.find(feature => feature.id === item.id);
      setAnnouncement(saved?.hasVoted ? `Your vote for ${item.title} is saved.` : `Your vote for ${item.title} was removed.`);
    } catch (failure) {
      // A response may be lost after the server saves a vote. Reload before another change.
      setReady(false);
      setAnnouncement("");
      setError(errorMessage(failure, "We couldn’t check whether your vote was saved. Reload the votes before trying again."));
    } finally {
      mutationInFlight.current = false;
      setPendingVote(null);
    }
  }

  function openSuggestion() {
    if (!ready || loading || mutationInFlight.current) return;
    setFormError("");
    setReceived(null);
    dialog.current?.showModal();
  }

  async function suggest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || loading || mutationInFlight.current) return;
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 5 || cleanTitle.length > 100) {
      setFormError("Give your idea a title between 5 and 100 characters.");
      return;
    }
    if (cleanDescription.length < 20 || cleanDescription.length > 600) {
      setFormError("Describe your idea in 20 to 600 characters so we understand what it would help you do.");
      return;
    }
    const website = new FormData(event.currentTarget).get("website");
    mutationInFlight.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        credentials: "same-origin",
        signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", title: cleanTitle, description: cleanDescription, website: typeof website === "string" ? website : "" }),
      });
      const data = await readResponse<SuggestionResponse>(response);
      if (!data.suggestion?.id) throw new Error("We couldn’t confirm that your suggestion was saved. Please try again.");
      setReceived(data.suggestion);
      setTitle("");
      setDescription("");
      setAnnouncement("Your suggestion has been received and is awaiting review.");
    } catch (failure) {
      const message = errorMessage(failure, "Your suggestion could not be sent. Your draft is still here; please try again.");
      setFormError(message);
      if (!(failure instanceof FeedbackRequestError) || failure.status === 409 || failure.status >= 500) {
        setReady(false);
        setError(message);
      }
    } finally {
      mutationInFlight.current = false;
      setSubmitting(false);
    }
  }

  const items: VisibleItem[] = features
    ? [...features]
    : seeds.map(seed => ({ ...seed, votes: null, hasVoted: false, source: "team" }));
  if (sort === "votes") items.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  const disabled = !ready || loading || pendingVote !== null || submitting;

  return (
    <section id="coming-soon" className="roadmap-board" aria-labelledby={`${id}-heading`}>
      <div className="roadmap-heading">
        <div>
          <p className="roadmap-eyebrow">Help shape what comes next</p>
          <h2 id={`${id}-heading`}>Coming soon.</h2>
          <p className="roadmap-intro">What would make your working day easier? Vote for the features that matter to you, or suggest an idea of your own.</p>
          <p className="roadmap-expectation">Votes help us prioritize. These are plans and ideas, with no promised release dates.</p>
        </div>
        <button className="roadmap-button" type="button" onClick={openSuggestion} disabled={disabled}>Suggest a feature <span aria-hidden="true">+</span></button>
      </div>

      <div className="roadmap-tools">
        <p>One vote per feature in this browser. Select again to remove it.</p>
        <label htmlFor={`${id}-sort`}>Sort by
          <select id={`${id}-sort`} value={sort} onChange={event => setSort(event.target.value as "roadmap" | "votes")} disabled={features === null || loading}>
            <option value="roadmap">Roadmap order</option>
            <option value="votes">Most votes</option>
          </select>
        </label>
      </div>

      <div className="roadmap-feedback" aria-live="polite" aria-atomic="true">
        {loading ? <p role="status">Loading vote counts…</p> : announcement ? <p role="status">{announcement}</p> : null}
      </div>
      {error && <div className="roadmap-error">
        <p role="alert">{error} {features ? "Your last loaded results are shown below." : "You can still explore the roadmap below."}</p>
        <button type="button" className="roadmap-button roadmap-button--outline" disabled={loading || pendingVote !== null || submitting} onClick={() => { setLoading(true); setReady(false); setAnnouncement(""); setReload(value => value + 1); }}>Reload votes</button>
      </div>}

      <ul className="roadmap-list" aria-busy={loading}>
        {items.map(item => (
          <li key={item.id} className="roadmap-item">
            <div className="roadmap-item__copy">
              <div className="roadmap-tags"><span className={`roadmap-tag roadmap-tag--${item.status}`}>{STATUS_LABELS[item.status]}</span>{item.source === "community" && <span className="roadmap-community">Community suggestion</span>}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <button type="button" className="roadmap-vote" aria-pressed={item.hasVoted} disabled={disabled} onClick={() => void vote(item)} aria-label={`${item.hasVoted ? "Remove your vote for" : "Vote for"} ${item.title}${item.votes === null ? ". Vote count unavailable." : `. ${item.votes} ${item.votes === 1 ? "vote" : "votes"}.`}`}>
              <svg viewBox="0 0 20 20" width={16} height={16} aria-hidden="true"><path d="m5 11 5-5 5 5M10 6v9" /></svg>
              <strong>{item.votes === null ? "—" : item.votes.toLocaleString("en-US")}</strong>
              <span>{pendingVote === item.id ? "Saving…" : item.hasVoted ? "Voted" : "Vote"}</span>
            </button>
          </li>
        ))}
      </ul>
      {!items.length && <p className="roadmap-empty">New roadmap ideas are being prepared. Suggest a feature you would find useful.</p>}
      {storage === "local" && <p className="roadmap-local">Preview feedback is saved on this Mac.</p>}
      <p className="roadmap-review-note">Suggestions are reviewed before they appear here. Once approved, other visitors can vote for them.</p>
      <noscript><p className="roadmap-review-note">Turn on JavaScript to load votes or suggest a feature.</p></noscript>

      <dialog ref={dialog} className="roadmap-dialog" aria-labelledby={`${id}-dialog-title`} aria-describedby={`${id}-dialog-description`}>
        <button type="button" className="roadmap-dialog__close" aria-label="Close suggestion form" onClick={() => dialog.current?.close()}>×</button>
        {received ? (
          <div className="roadmap-received" role="status">
            <p className="roadmap-eyebrow">Awaiting review</p>
            <h3 id={`${id}-dialog-title`}>Suggestion received.</h3>
            <p id={`${id}-dialog-description`}><strong>{received.title}</strong> is saved for review. If approved, it will appear on the roadmap so other visitors can vote for it.</p>
            <button type="button" className="roadmap-button" onClick={() => dialog.current?.close()}>Done</button>
          </div>
        ) : (
          <>
            <p className="roadmap-eyebrow">An idea for your working day</p>
            <h3 id={`${id}-dialog-title`}>Suggest a feature.</h3>
            <p id={`${id}-dialog-description`}>Tell us what you want to do and how it would help. Please leave out contact details and private customer information.</p>
            <form onSubmit={suggest}>
              <fieldset disabled={disabled}>
                <label htmlFor={`${id}-suggestion-title`}>Feature title</label>
                <input id={`${id}-suggestion-title`} name="title" value={title} onChange={event => setTitle(event.target.value)} minLength={5} maxLength={100} required autoFocus autoComplete="off" placeholder="For example, a waiting list for cancellations" aria-describedby={`${id}-title-hint`} />
                <p className="roadmap-field-hint" id={`${id}-title-hint`}>5–100 characters</p>
                <label htmlFor={`${id}-suggestion-description`}>What would it help you do?</label>
                <textarea id={`${id}-suggestion-description`} name="description" value={description} onChange={event => setDescription(event.target.value)} minLength={20} maxLength={600} required rows={5} placeholder="Describe the problem and the change you would like to see." aria-describedby={`${id}-description-hint`} />
                <p className="roadmap-field-hint" id={`${id}-description-hint`}>20–600 characters. Approved suggestions are visible to other visitors.</p>
                <div hidden aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
              </fieldset>
              {formError && <p className="roadmap-form-error" role="alert">{formError}</p>}
              {!ready && <p className="roadmap-form-error" role="alert">Feedback is temporarily unavailable. Close this form and reload the votes to reconnect. Your draft will be kept.</p>}
              <div className="roadmap-form-actions">
                <button type="submit" className="roadmap-button" disabled={disabled}>{submitting ? "Sending suggestion…" : "Send suggestion"}</button>
                <button type="button" className="roadmap-button roadmap-button--outline" onClick={() => dialog.current?.close()}>Cancel</button>
              </div>
              <p className="roadmap-form-status" role="status" aria-live="polite">{submitting ? "Saving your suggestion for review…" : ""}</p>
            </form>
          </>
        )}
      </dialog>
    </section>
  );
}
