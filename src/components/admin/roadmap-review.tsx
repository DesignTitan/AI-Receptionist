"use client";

import { useEffect, useRef, useState } from "react";
import type { Suggestion } from "@/lib/roadmap/types";

export function RoadmapReview() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const requestInFlight = useRef<AbortController | null>(null);
  const headings = useRef(new Map<string, HTMLHeadingElement>());
  const focusAfterReview = useRef<string | null>(null);

  async function load() {
    if (requestInFlight.current) return;
    const controller = new AbortController();
    requestInFlight.current = controller;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/roadmap", {
        cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.suggestions)) throw Error(data.error || "Suggestions could not be loaded.");
      if (requestInFlight.current !== controller) return;
      setSuggestions(data.suggestions);
      setReady(true);
    } catch (e) {
      if (controller.signal.aborted || requestInFlight.current !== controller) return;
      setReady(false);
      setError(e instanceof Error && e.name === "Error" ? e.message : "Suggestions could not be loaded. Please refresh and try again.");
    } finally {
      if (requestInFlight.current === controller) { requestInFlight.current = null; setLoading(false); }
    }
  }
  useEffect(() => {
    void load();
    return () => { requestInFlight.current?.abort(); requestInFlight.current = null; };
  }, []);

  useEffect(() => {
    const id = focusAfterReview.current;
    if (!id) return;
    headings.current.get(id)?.focus({ preventScroll: true });
    focusAfterReview.current = null;
  }, [suggestions]);

  async function review(item: Suggestion, status: "approved" | "declined") {
    if (!ready || loading || requestInFlight.current) return;
    const controller = new AbortController();
    requestInFlight.current = controller;
    setBusy(item.id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/roadmap", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, status }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.suggestions)) throw Error(data.error || "Your decision could not be confirmed.");
      if (requestInFlight.current !== controller) return;
      focusAfterReview.current = item.id;
      setSuggestions(data.suggestions);
      setMessage(status === "approved" ? `“${item.title}” is now open for public votes.` : `“${item.title}” is hidden from the public roadmap.`);
    } catch (e) {
      if (controller.signal.aborted || requestInFlight.current !== controller) return;
      setReady(false);
      const detail = e instanceof Error && e.name === "Error" ? e.message : "Your decision could not be confirmed.";
      setError(`${detail} Refresh the suggestions before making another decision.`);
    } finally {
      if (requestInFlight.current === controller) { requestInFlight.current = null; setBusy(null); }
    }
  }

  const reviewDisabled = !ready || loading || !!busy;

  return <div className="mt-8">
    <div className="mb-6 flex items-center justify-between gap-4"><p className="text-sm text-muted">{suggestions.filter(s => s.status === "pending").length} awaiting review</p><button className="rounded-full border border-line px-4 py-2 text-sm" onClick={load} disabled={loading || !!busy}>Refresh</button></div>
    <p role="status" aria-live="polite" className="mb-3 break-words text-sm text-muted [overflow-wrap:anywhere]">{loading ? "Loading suggestions…" : message}</p>
    {error && <p role="alert" className="mb-5 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>}
    {!loading && !error && !suggestions.length && <p className="rounded-2xl border border-line p-8 text-muted">New feature ideas will appear here when visitors submit them.</p>}
    <div className="space-y-4">
      {suggestions.map(item => <article key={item.id} className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 ref={element => { if (element) headings.current.set(item.id, element); else headings.current.delete(item.id); }} tabIndex={-1} className="min-w-0 max-w-full flex-1 break-words text-xl font-medium [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-4">{item.title}</h2><span className="rounded-full border border-line px-3 py-1 text-xs capitalize">{item.status}</span></div>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{item.description}</p>
        <p className="mt-3 text-xs text-subtle">Submitted {new Date(item.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {item.status !== "approved" && <button disabled={reviewDisabled} onClick={() => review(item, "approved")} className="rounded-full bg-ink px-5 py-3 text-sm text-bg disabled:opacity-50">{busy === item.id ? "Saving…" : "Approve for public voting"}</button>}
          {item.status !== "declined" && <button disabled={reviewDisabled} onClick={() => review(item, "declined")} className="rounded-full border border-line px-5 py-3 text-sm disabled:opacity-50">{item.status === "approved" ? "Hide from roadmap" : "Decline"}</button>}
        </div>
      </article>)}
    </div>
  </div>;
}
