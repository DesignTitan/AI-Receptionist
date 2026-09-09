"use client";
import { useState } from "react";
import type { TeamMember } from "@/lib/platform/model";
import { HumanCheck } from "./human-check";
export function CustomerBookingForm({
  slug,
  team,
  today,
  siteKey,
  timezone,
}: {
  slug: string;
  team: TeamMember[];
  today: string;
  siteKey: string;
  timezone: string;
}) {
  const [member, setMember] = useState(team[0].id),
    [date, setDate] = useState(today),
    [slots, setSlots] = useState<{ start: string; label: string }[]>([]),
    [time, setTime] = useState(""),
    [token, setToken] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [reset, setReset] = useState(0);
  async function load() {
    setBusy(true);
    setError("");
    setTime("");
    try {
      const r = await fetch(
        `/api/bookings/${slug}?member=${encodeURIComponent(member)}&date=${date}`,
      );
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setSlots(j.slots);
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="platform-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch(`/api/bookings/${slug}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              member,
              starts_at: time,
              full_name: f.get("full_name"),
              phone: f.get("phone"),
              email: f.get("email"),
              consent: f.get("consent") === "on",
              token,
            }),
          });
          const j = await r.json();
          if (!r.ok) throw Error(j.error);
          location.assign(j.url);
        } catch (e) {
          setError((e as Error).message);
          setToken("");
          setReset((n) => n + 1);
          setLoaded(false);
          setTime("");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Find your time.</h2>
      <div className="platform-fields">
        <label>
          Who would you like to see?
          <select
            value={member}
            onChange={(e) => {
              setMember(e.target.value);
              setLoaded(false);
              setTime("");
            }}
          >
            {team.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.service} · {t.minutes} min
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setLoaded(false);
              setTime("");
            }}
          />
        </label>
      </div>
      <div className="platform-actions">
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={load}
        >
          Show available times
        </button>
      </div>
      <p className="platform-note">
        Times are in {timezone}. Bookings need at least 90 minutes’ notice.
      </p>
      {loaded && (
        <div className="platform-slots">
          {slots.length ? (
            slots.map((s) => (
              <label className="platform-plan" key={s.start}>
                <input
                  type="radio"
                  name="slot"
                  checked={time === s.start}
                  onChange={() => setTime(s.start)}
                />
                {s.label}
              </label>
            ))
          ) : (
            <p>No available times on this day. Try another date.</p>
          )}
        </div>
      )}
      {time && (
        <>
          <div className="platform-fields">
            <label>
              Your name
              <input
                name="full_name"
                required
                autoComplete="name"
                maxLength={120}
              />
            </label>
            <label>
              Mobile number
              <input name="phone" type="tel" required autoComplete="tel" />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" autoComplete="email" />
            </label>
          </div>
          <label className="my-5">
            <input type="checkbox" name="consent" required />I agree to be contacted
            about this appointment, including a recorded AI confirmation call.
          </label>
          {siteKey ? (
            <HumanCheck siteKey={siteKey} onToken={setToken} reset={reset} />
          ) : (
            <p>Online booking is being prepared. Please call the business.</p>
          )}
          <div className="platform-actions">
            <button disabled={busy || !token}>
              {busy ? "Reserving…" : "Reserve my appointment →"}
            </button>
          </div>
        </>
      )}
      {error && (
        <p className="platform-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
