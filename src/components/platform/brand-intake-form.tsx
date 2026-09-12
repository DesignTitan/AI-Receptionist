"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Customer } from "@/lib/platform/model";
import { AccountShell } from "./account-shell";
import { weeklyHoursFor } from "@/lib/platform/weekly-hours";
import { WeeklyHoursEditor } from "./weekly-hours-editor";
import styles from "./business-setup-form.module.css";

type Props = { customer: Customer; preview?: boolean };

const zoneLabels: Record<string, string> = {
  "America/New_York": "Eastern Time (US & Canada)",
  "America/Detroit": "Eastern Time (Michigan)",
  "America/Chicago": "Central Time (US & Canada)",
  "America/Denver": "Mountain Time (US & Canada)",
  "America/Los_Angeles": "Pacific Time (US & Canada)",
  "America/Phoenix": "Arizona Time (no daylight saving)",
  "America/Anchorage": "Alaska Time",
  "Pacific/Honolulu": "Hawaii Time (no daylight saving)",
};
const zoneLabel = (zone: string) => zoneLabels[zone] ?? zone.replaceAll("_", " ");
const zones = [
  "America/New_York",
  "America/Detroit",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

export function BrandIntakeForm({ customer, preview = false }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);

  const brand = customer.config.brand;
  const initialHours = useMemo(
    () => brand?.weeklyHours ?? weeklyHoursFor(customer.config),
    [brand?.weeklyHours, customer.config],
  );
  const [weeklyHours, setWeeklyHours] = useState(initialHours);
  const [timezone, setTimezone] = useState(brand?.timezone ?? customer.config.timezone);

  const [greetingName, setGreetingName] = useState(brand?.greetingName ?? "");
  const [whatYouDo, setWhatYouDo] = useState(brand?.whatYouDo ?? "");
  const [phoneToAnswer, setPhoneToAnswer] = useState(brand?.phoneToAnswer ?? customer.config.phone ?? "");
  const [escalationName, setEscalationName] = useState(brand?.escalateTo?.name ?? "");
  const [escalationPhone, setEscalationPhone] = useState(brand?.escalateTo?.phone ?? "");
  const [topCallTypes, setTopCallTypes] = useState<string[]>(
    brand?.topCallTypes?.length ? brand.topCallTypes : ["", "", ""],
  );
  const [bookVsMessage, setBookVsMessage] = useState(brand?.bookVsMessage ?? "book_when_possible");
  const [price, setPrice] = useState(brand?.faqs?.price ?? "");
  const [serviceArea, setServiceArea] = useState(brand?.faqs?.serviceArea ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(brand?.websiteUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(brand?.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(brand?.facebookUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(brand?.tiktokUrl ?? "");

  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSaved(false);
  }, [greetingName, whatYouDo, phoneToAnswer, escalationName, escalationPhone, topCallTypes, bookVsMessage, price, serviceArea, timezone, weeklyHours, websiteUrl, instagramUrl, facebookUrl, tiktokUrl]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSaved(false);
    try {
      // Minimal client presence checks; server validates fully
      if (!customer.business_name.trim()) throw Error("Enter your business name.");
      if (!greetingName.trim()) throw Error("Enter the greeting name.");
      if (!whatYouDo.trim()) throw Error("Describe what you do.");
      if (!phoneToAnswer.trim()) throw Error("Enter the phone number to answer.");
      if (!escalationName.trim() || !escalationPhone.trim())
        throw Error("Add an escalation contact.");
      const calls = topCallTypes.map((s) => s.trim()).filter(Boolean);
      if (!calls.length) throw Error("Enter at least one top call type.");

      setBusy(true);
      const r = await fetch("/api/account/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: {
            businessName: customer.business_name,
            greetingName,
            whatYouDo,
            phoneToAnswer,
            escalateTo: { name: escalationName, phone: escalationPhone },
            topCallTypes: calls.slice(0, 3),
            bookVsMessage,
            faqs: { price, serviceArea },
            timezone,
            weeklyHours,
            websiteUrl,
            instagramUrl,
            facebookUrl,
            tiktokUrl,
          },
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error ?? "We couldn’t save your brand details.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please check your details.");
    } finally {
      setBusy(false);
    }
  }

  const hoursNote =
    "These are your phone/booking hours. You can refine later if needed.";

  const content = (
    <>
      <header className={styles.heading}>
        <h1>Brand intake</h1>
        <p>Tell us the essentials so your AI receptionist sounds right.</p>
      </header>
      <form ref={form} className={styles.form} onSubmit={submit} noValidate>
        <section className={`${styles.section} ${styles.first}`} aria-labelledby="brand-basics">
          <h2 id="brand-basics" className={styles.sectionTitle}>
            Basics
          </h2>
          <div className="platform-fields">
            <label>
              Business name
              <input value={customer.business_name} readOnly aria-readonly />
            </label>
            <label>
              What you do (1 line)
              <input
                required
                maxLength={140}
                value={whatYouDo}
                onChange={(e) => setWhatYouDo(e.target.value)}
                placeholder="e.g. Neighborhood dog grooming and spa"
              />
            </label>
            <label>
              Greeting name (we’ll say this)
              <input
                required
                maxLength={80}
                value={greetingName}
                onChange={(e) => setGreetingName(e.target.value)}
                placeholder="e.g. Willow Studio"
              />
            </label>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="brand-hours">
          <h2 id="brand-hours" className={styles.sectionTitle}>
            Hours & timezone
          </h2>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Your week</h2>
                <p>{hoursNote}</p>
              </div>
              <label className={styles.zone}>
                Location time zone
                <select
                  aria-label="Location time zone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {Array.from(new Set([...zones, timezone])).map((z) => (
                    <option key={z} value={z}>
                      {zoneLabel(z)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <WeeklyHoursEditor value={weeklyHours} onChange={setWeeklyHours} />
          </div>
        </section>
        <section className={styles.section} aria-labelledby="brand-phones">
          <h2 id="brand-phones" className={styles.sectionTitle}>
            Phones & escalation
          </h2>
          <div className="platform-fields">
            <label>
              Phone to answer
              <input
                name="answer_phone"
                type="tel"
                required
                value={phoneToAnswer}
                onChange={(e) => setPhoneToAnswer(e.target.value)}
                placeholder="(313) 555-0142"
              />
            </label>
            <label>
              Escalate to — name
              <input
                required
                value={escalationName}
                onChange={(e) => setEscalationName(e.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </label>
            <label>
              Escalate to — phone
              <input
                type="tel"
                required
                value={escalationPhone}
                onChange={(e) => setEscalationPhone(e.target.value)}
                placeholder="(313) 555-0177"
              />
            </label>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="brand-calls">
          <h2 id="brand-calls" className={styles.sectionTitle}>
            Top calls & booking rule
          </h2>
          <div className="platform-fields">
            {[0, 1, 2].map((i) => (
              <label key={i}>
                Top call type {i + 1}
                <input
                  maxLength={60}
                  value={topCallTypes[i] ?? ""}
                  onChange={(e) => {
                    const next = [...topCallTypes];
                    next[i] = e.target.value;
                    setTopCallTypes(next);
                  }}
                  placeholder={i === 0 ? "e.g. Book a grooming appointment" : i === 1 ? "e.g. Reschedule" : "e.g. General question"}
                />
              </label>
            ))}
            <fieldset>
              <legend>When to book vs take a message</legend>
              <label className={styles.answering}>
                <span>
                  <input
                    type="radio"
                    name="rule"
                    value="book_when_possible"
                    checked={bookVsMessage === "book_when_possible"}
                    onChange={() => setBookVsMessage("book_when_possible")}
                  />
                  Book when a slot fits
                </span>
              </label>
              <label className={styles.answering}>
                <span>
                  <input
                    type="radio"
                    name="rule"
                    value="take_message_only"
                    checked={bookVsMessage === "take_message_only"}
                    onChange={() => setBookVsMessage("take_message_only")}
                  />
                  Take a message only
                </span>
              </label>
              <label className={styles.answering}>
                <span>
                  <input
                    type="radio"
                    name="rule"
                    value="ask_then_decide"
                    checked={bookVsMessage === "ask_then_decide"}
                    onChange={() => setBookVsMessage("ask_then_decide")}
                  />
                  Ask first, then decide
                </span>
              </label>
            </fieldset>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="brand-faqs">
          <h2 id="brand-faqs" className={styles.sectionTitle}>
            FAQs we never invent
          </h2>
          <div className="platform-fields">
            <label>
              Price — what we can say
              <textarea
                rows={3}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. We don’t quote prices by phone. We’ll give a range and confirm in person."
              />
            </label>
            <label>
              Service area — what we can say
              <textarea
                rows={3}
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. We serve Midtown and Downtown. No house calls."
              />
            </label>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="brand-optional">
          <h2 id="brand-optional" className={styles.sectionTitle}>
            Optional (for later enrich)
          </h2>
          <div className="platform-fields">
            <label>
              Website URL
              <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
            </label>
            <label>
              Instagram
              <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/…" />
            </label>
            <label>
              Facebook
              <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/…" />
            </label>
            <label>
              TikTok
              <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@…" />
            </label>
          </div>
        </section>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {saved && (
          <div role="status" className={styles.callout}>
            <strong>Saved.</strong>
            <p>Your brand profile is stored. This does not activate calls.</p>
          </div>
        )}
        <div className={styles.actions}>
          <button className={styles.primary} disabled={busy}>
            {busy ? "Saving…" : "Save brand →"}
          </button>
          <p>{preview ? "Preview account · Nothing will be sent." : "Dev setup · No live publish."}</p>
        </div>
      </form>
    </>
  );

  const firstName = customer.config.contactName?.trim().split(/\s+/)[0] ?? "";
  return <AccountShell name={firstName} preview={preview} billingAvailable={!!customer.stripe_customer_id}>{content}</AccountShell>;
}

