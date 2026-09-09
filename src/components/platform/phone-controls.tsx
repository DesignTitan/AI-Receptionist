"use client";

import { useEffect, useRef, useState } from "react";
import type { BusinessConfig } from "@/lib/platform/model";
import { PHONE_MODES, PHONE_MODE_LABELS, resolvePhoneRoute, validatePhoneSettings, type PhoneMode, type PhoneSettings, type PhoneSnapshot } from "@/lib/platform/phone-settings";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function ModeSelect({ label, value, onChange }: { label: string; value: PhoneMode; onChange: (mode: PhoneMode) => void }) {
  return <label>{label}<select value={value} onChange={event => onChange(event.target.value as PhoneMode)}>
    {PHONE_MODES.map(mode => <option key={mode} value={mode}>{PHONE_MODE_LABELS[mode]}</option>)}
  </select></label>;
}
function localTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(value));
}
function reasonLabel(reason: string, holiday?: string) {
  return reason === "business_hours" ? "Business hours" : reason === "after_hours" ? "Outside business hours" : reason === "holiday" ? holiday || "Holiday or vacation" : reason === "override" ? "Temporary change" : "Routing switched off";
}

/** Optional initial data supports an isolated local preview without bypassing owner auth. */
export function PhoneControls({ config, initial }: { config: BusinessConfig; initial?: PhoneSnapshot }) {
  const [saved, setSaved] = useState<PhoneSnapshot | null>(initial ?? null);
  const [draft, setDraft] = useState<PhoneSettings | null>(initial?.settings ?? null);
  const [loading, setLoading] = useState(!initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => initial ? new Date(initial.checkedAt) : new Date(0));
  const [overrideMode, setOverrideMode] = useState<PhoneMode>("ai_first");
  const [overrideHours, setOverrideHours] = useState("4");
  const dirty = !!saved && !!draft && JSON.stringify(saved.settings) !== JSON.stringify(draft);
  const editing = useRef(false);
  const writeEpoch = useRef(0);
  editing.current = dirty || busy;

  function accept(data: PhoneSnapshot) {
    setSaved(data); setDraft(data.settings); setNow(new Date());
  }
  async function reload() {
    writeEpoch.current++;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/phone", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Phone settings could not load.");
      accept(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Phone settings could not load."); }
    finally { writeEpoch.current++; setLoading(false); }
  }
  useEffect(() => {
    if (initial) return;
    const abort = new AbortController();
    fetch("/api/account/phone", { cache: "no-store", signal: abort.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw Error(data.error || "Phone settings could not load.");
        if (!abort.signal.aborted) accept(data);
      }).catch(e => { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Phone settings could not load."); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [initial]);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    // Keep connection state current without discarding an owner's unfinished edits.
    // Isolated fixture data never polls the authenticated API.
    if (initial) return;
    const abort = new AbortController();
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      const epoch = writeEpoch.current;
      try {
        const response = await fetch("/api/account/phone", { cache: "no-store", signal: abort.signal });
        if (!response.ok) return;
        const data: PhoneSnapshot = await response.json();
        if (abort.signal.aborted || epoch !== writeEpoch.current) return;
        if (editing.current) {
          // Keep the old revision so a concurrent settings change is caught on save.
          setSaved(current => current ? { ...data, revision: current.revision } : current);
        } else accept(data);
      } catch { /* Retain the visible last-checked timestamp on a failed refresh. */ }
      finally { inFlight = false; }
    };
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => { abort.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [initial]);
  function change<K extends keyof PhoneSettings>(key: K, value: PhoneSettings[K]) {
    setDraft(current => current ? { ...current, [key]: value } : current);
    setMessage(""); setError("");
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !saved) return;
    writeEpoch.current++;
    setBusy(true); setError(""); setMessage("");
    try {
      const settings = validatePhoneSettings(draft, config, [config.phone]);
      const response = await fetch("/api/account/phone", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, revision: saved.revision }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Phone settings could not be saved.");
      accept(data);
      setMessage(data.routingAvailable ? "Phone settings saved." : "Preferences saved. Incoming-call routing still needs a verified, active connection.");
    } catch (e) { setError(e instanceof Error ? e.message : "Phone settings could not be saved."); }
    finally { writeEpoch.current++; setBusy(false); }
  }

  if (!saved || !draft) return <section className="platform-panel phone-controls mb-6" aria-labelledby="phone-title" aria-busy={loading}>
    <h2 id="phone-title">Your phone, your choice</h2>
    <p>Manage confirmation calls and decide how incoming calls should be answered.</p>
    {loading ? <p role="status">Loading phone settings…</p> : <><p role="alert" className="platform-error">{error}</p><button type="button" onClick={reload}>Try again</button></>}
  </section>;

  const current = resolvePhoneRoute(saved.settings, saved.timezone, now);
  const schedule = resolvePhoneRoute({ ...saved.settings, inboundEnabled: true, override: null }, saved.timezone, now);
  const verified = saved.connection.status === "ready" && !!saved.connection.verified_at;
  const connectionLabel = saved.routingAvailable ? "Connected and verified" : saved.connection.status === "testing" || verified ? "Setup or testing in progress" : "Not connected";
  const actualLabel = !saved.routingAvailable ? "Incoming-call routing is not active yet"
    : current.mode === "off" || current.mode === "staff_only" ? saved.settings.staffNumber ? "Calls go to staff" : "Calls go to voicemail"
    : current.mode === "ai_first" && !saved.aiAvailable ? saved.settings.fallback === "staff" && saved.settings.staffNumber ? "Calls go to staff" : "Calls go to voicemail"
    : PHONE_MODE_LABELS[current.mode];
  const activeOverride = saved.settings.override && Date.parse(saved.settings.override.expiresAt) > now.getTime();

  return <section className="platform-panel phone-controls mb-6" aria-labelledby="phone-title">
    <div className="phone-heading"><div><h2 id="phone-title">Your phone, your choice</h2><p>Confirmation calls and incoming calls are separate. Choose what works for your business.</p></div><span className={`platform-badge ${saved.routingAvailable ? "phone-connected" : ""}`}>{connectionLabel}</span></div>
    <div className="phone-status" aria-live="polite">
      <div><span className="phone-caption">Who answers right now</span><strong>{actualLabel}</strong>
        <p>{saved.routingAvailable ? reasonLabel(current.reason, current.holidayLabel) : "These are saved preferences. Your phone line must be connected and tested before they can route calls."}</p>
        {saved.routingAvailable && !saved.aiAvailable && current.mode !== "off" && current.mode !== "staff_only" && <p>{saved.usageKnown ? "AI calls are paused because fewer than five unreserved minutes remain within your allowance and spending limit." : "AI calls are paused until your current call allowance can be checked."} Your staff or voicemail fallback remains available.</p>}
        {saved.routingAvailable && current.mode === "off" && <p>Turning this off does not change forwarding already set up with your phone provider.</p>}
        {saved.connection.inbound_number && <p>Business line: {saved.connection.inbound_number}</p>}
        {!saved.serviceActive && verified && <p>AI calling also requires an active account.</p>}
      </div>
      <div><span className="phone-caption">Saved schedule at this time</span><strong>{PHONE_MODE_LABELS[schedule.mode]}</strong><p>{reasonLabel(schedule.reason, schedule.holidayLabel)} · {saved.timezone}</p>
        {activeOverride && <p>A temporary change takes priority until {localTime(saved.settings.override!.expiresAt, saved.timezone)}.</p>}
        {dirty && <p className="phone-unsaved">Your edits below are not saved yet.</p>}
      </div>
    </div>
    <p className="platform-note">Connection checked {localTime(saved.checkedAt, saved.timezone)}. The schedule follows your business timezone, including daylight saving changes.</p>

    <form onSubmit={save}>
      <fieldset disabled={busy || loading} className="phone-features">
        <legend className="phone-caption">Two independent features</legend>
        <label className="phone-toggle"><input type="checkbox" checked={draft.confirmationCalls} onChange={event => change("confirmationCalls", event.target.checked)} /><span><strong>Confirmation calls after online bookings</strong><small>AI calls customers to confirm their appointments. Turn this off to follow up yourself.</small></span></label>
        <label className="phone-toggle"><input type="checkbox" checked={draft.inboundEnabled} onChange={event => change("inboundEnabled", event.target.checked)} /><span><strong>Use saved incoming-call routing</strong><small>{saved.routingAvailable ? "Use your schedule and temporary changes to decide who answers." : "Prepare your preferences now. Saving this does not connect your phone line."}</small></span></label>
      </fieldset>

      <fieldset disabled={busy || loading} className="phone-section">
        <legend>Who should answer?</legend>
        <div className="phone-fields"><ModeSelect label="During business hours" value={draft.businessHoursMode} onChange={value => change("businessHoursMode", value)} /><ModeSelect label="Outside business hours" value={draft.afterHoursMode} onChange={value => change("afterHoursMode", value)} /></div>
        <p className="platform-note">A menu lets callers choose staff or AI. Without a staff number, the staff option goes to voicemail. “Staff only” never sends a caller to AI.</p>
        <div className="phone-fields">
          <label>Separate staff number<input type="tel" autoComplete="tel" placeholder="+12125550123" value={draft.staffNumber ?? ""} onChange={event => change("staffNumber", event.target.value || null)} /><small className="phone-help">Include the country code. Use a different number from your public business number and AI lines to prevent forwarding loops.</small></label>
          <label>Let staff ring for<select value={draft.ringSeconds} onChange={event => change("ringSeconds", Number(event.target.value))}>{[10, 15, 20, 25, 30, 45, 60].map(seconds => <option key={seconds} value={seconds}>{seconds} seconds</option>)}{![10,15,20,25,30,45,60].includes(draft.ringSeconds) && <option value={draft.ringSeconds}>{draft.ringSeconds} seconds</option>}</select></label>
          <label>If staff do not answer<select value={draft.noAnswerAction} onChange={event => change("noAnswerAction", event.target.value as PhoneSettings["noAnswerAction"])}><option value="voicemail">Take a voicemail</option><option value="ai">Let AI help with the booking</option></select><small className="phone-help">“Staff only” always uses voicemail if unanswered.</small></label>
          <label>If AI is unavailable or the call budget is used up<select value={draft.fallback} onChange={event => change("fallback", event.target.value as PhoneSettings["fallback"])}><option value="voicemail">Take a voicemail</option><option value="staff">Ring staff</option></select></label>
        </div>
      </fieldset>

      <fieldset disabled={busy || loading} className="phone-section">
        <legend>Your weekly phone hours</legend><p className="platform-note">These hours control phone routing in {saved.timezone}. They do not change appointment availability. Unchecked days use your outside-hours choice.</p>
        <div className="phone-week">
          {draft.weeklyHours.map(day => <div className="phone-day" key={day.day}>
            <label className="phone-day-name"><input type="checkbox" checked={day.enabled} onChange={event => change("weeklyHours", draft.weeklyHours.map(row => row.day === day.day ? { ...row, enabled: event.target.checked } : row))} />{DAY_NAMES[day.day]}</label>
            <label>Opens<input aria-label={`${DAY_NAMES[day.day]} opening time`} type="time" disabled={!day.enabled} required={day.enabled} value={day.opens} onChange={event => change("weeklyHours", draft.weeklyHours.map(row => row.day === day.day ? { ...row, opens: event.target.value } : row))} /></label>
            <label>Closes<input aria-label={`${DAY_NAMES[day.day]} closing time`} type="time" disabled={!day.enabled} required={day.enabled} value={day.closes === "24:00" ? "00:00" : day.closes} onChange={event => change("weeklyHours", draft.weeklyHours.map(row => row.day === day.day ? { ...row, closes: event.target.value === "00:00" ? "24:00" : event.target.value } : row))} /></label>
            <span className="phone-day-note">{!day.enabled ? "Outside-hours routing" : day.closes === "24:00" ? "Closes at midnight" : day.closes < day.opens ? "Closes the next day" : "Business-hours routing"}</span>
          </div>)}
        </div>
      </fieldset>

      <fieldset disabled={busy || loading} className="phone-section">
        <legend>Holidays and time away</legend><p className="platform-note">Choose dates in {saved.timezone}. Both the start and end dates are included. These settings take priority over your weekly phone hours.</p>
        {draft.holidays.length === 0 && <p className="phone-empty">No holiday or vacation dates added.</p>}
        <div className="phone-holidays">{draft.holidays.map((holiday, index) => <div className="phone-holiday" key={holiday.id}>
          <label>Name<input aria-label={`Holiday ${index + 1} name`} maxLength={80} required value={holiday.label} placeholder="Summer break" onChange={event => change("holidays", draft.holidays.map(row => row.id === holiday.id ? { ...row, label: event.target.value } : row))} /></label>
          <div className="phone-fields"><label>First day<input aria-label={`Holiday ${index + 1} first day`} type="date" min="2000-01-01" max="2100-12-31" required value={holiday.startsOn} onChange={event => change("holidays", draft.holidays.map(row => row.id === holiday.id ? { ...row, startsOn: event.target.value } : row))} /></label><label>Last day<input aria-label={`Holiday ${index + 1} last day`} type="date" min={holiday.startsOn || "2000-01-01"} max="2100-12-31" required value={holiday.endsOn} onChange={event => change("holidays", draft.holidays.map(row => row.id === holiday.id ? { ...row, endsOn: event.target.value } : row))} /></label></div>
          <div className="phone-holiday-action"><ModeSelect label="Who answers during these dates" value={holiday.mode} onChange={value => change("holidays", draft.holidays.map(row => row.id === holiday.id ? { ...row, mode: value } : row))} /><button className="secondary" type="button" aria-label={`Remove ${holiday.label || `holiday ${index + 1}`}`} onClick={() => change("holidays", draft.holidays.filter(row => row.id !== holiday.id))}>Remove</button></div>
        </div>)}</div>
        <button className="secondary" type="button" disabled={draft.holidays.length >= 30} onClick={() => change("holidays", [...draft.holidays, { id: crypto.randomUUID(), label: "", startsOn: "", endsOn: "", mode: "ai_first" }])}>Add dates</button>
      </fieldset>

      <fieldset disabled={busy || loading} className="phone-section">
        <legend>A temporary change</legend><p className="platform-note">Taking a break or stepping out? A temporary choice takes priority over holidays and weekly hours, then returns to your schedule automatically. Incoming-call routing must still be switched on.</p>
        {draft.override && <div className="phone-override"><p><strong>{PHONE_MODE_LABELS[draft.override.mode]}</strong><br />{Date.parse(draft.override.expiresAt) > now.getTime() ? "Until" : "Expired"} {localTime(draft.override.expiresAt, saved.timezone)}</p><button className="secondary" type="button" onClick={() => change("override", null)}>Return to schedule</button></div>}
        <div className="phone-fields"><ModeSelect label="Temporary answering choice" value={overrideMode} onChange={setOverrideMode} /><label>Return to the schedule after<select value={overrideHours} onChange={event => setOverrideHours(event.target.value)}><option value="1">1 hour</option><option value="4">4 hours</option><option value="8">8 hours</option><option value="24">24 hours</option><option value="168">7 days</option></select></label></div>
        <button className="secondary phone-override-button" type="button" onClick={() => change("override", { mode: overrideMode, expiresAt: new Date(Date.now() + Number(overrideHours) * 3600000).toISOString() })}>Prepare temporary change</button>
        <p className="phone-help">Use “Save phone settings” below to apply the temporary change or return to your schedule.</p>
      </fieldset>

      <p className="platform-note phone-usage">AI calls use the same plan minutes and extra-spend limit shown in your billing section. Each AI call can last up to five minutes. If there is not enough call budget, incoming calls use your fallback; online bookings remain available.</p>
      {error && <p className="platform-error" role="alert">{error}</p>}
      {message && <p className="platform-success" role="status">{message}</p>}
      <div className="platform-actions phone-save"><button disabled={busy || loading || !dirty} type="submit">{busy ? "Saving…" : "Save phone settings"}</button><button disabled={busy || loading} type="button" className="secondary" onClick={reload}>{loading ? "Refreshing…" : dirty ? "Discard edits and reload" : "Refresh connection"}</button>{dirty && <span className="phone-help">Unsaved changes</span>}</div>
    </form>
  </section>;
}
