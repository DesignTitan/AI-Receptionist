"use client";
import {
  COMMON_FEATURES,
  PILOT_SETUP_CENTS,
  SETUP_CENTS,
  SETUP_OFFER,
} from "@/lib/platform/pricing";
import { useState } from "react";
import { PLANS, type Customer, type Plan } from "@/lib/platform/model";
import { PhoneProviderFields } from "./phone-provider-fields";
export function StartForm({
  customer,
  plan,
}: {
  customer: Customer | null;
  plan: Plan;
}) {
  const [chosen, setChosen] = useState(customer?.plan ?? plan),
    [team, setTeam] = useState(
      customer?.config.team ?? [
        { id: "member-1", name: "", service: "", minutes: 30 },
      ],
    );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const c = customer?.config;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const body = {
            business_name: f.get("business_name"),
            plan: chosen,
            config: {
              trade: f.get("trade"),
              timezone: f.get("timezone"),
              days: f.getAll("days").map(Number),
              opens: f.get("opens"),
              closes: f.get("closes"),
              address: f.get("address"),
              phone: f.get("phone"),
              color: f.get("color"),
              areaCode: f.get("areaCode"),
              phoneSetup: {
                provider: f.get("phoneProvider"),
                serviceType: f.get("phoneServiceType"),
                serviceName: f.get("phoneServiceName"),
                bookingSystem: f.get("bookingSystem"),
              },
              team,
            },
          };
          const r = await fetch("/api/account/business", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const j = await r.json();
          if (!r.ok) throw Error(j.error);
          setSaved(true);
          const pay = await fetch("/api/account/checkout", { method: "POST" });
          const p = await pay.json();
          if (!pay.ok) throw Error(p.error);
          location.assign(p.url);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset>
        <legend>01 — Your front desk</legend>
        <div className="platform-plans">
          {Object.entries(PLANS).map(([id, p]) => (
            <label className="platform-plan" key={id}>
              <input
                type="radio"
                name="plan"
                checked={chosen === id}
                onChange={() => setChosen(id as Plan)}
              />
              {p.name}
              <strong className="platform-price">
                ${p.monthly}
                <small style={{ fontSize: 13, fontWeight: 400 }}>/mo</small>
              </strong>
              <span>{p.minutes.toLocaleString()} minutes included</span>
              <span>
                Estimated {p.estimatedCalls} calls at two minutes each
              </span>
            </label>
          ))}
        </div>
        <p className="platform-note">{SETUP_OFFER}</p>
        <section
          className="platform-panel"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2>Your {PLANS[chosen].name} payment breakdown</h2>
          <div className="platform-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Charge</th>
                  <th scope="col">Pilot setup</th>
                  <th scope="col">Standard setup</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">First month</th>
                  <td>${PLANS[chosen].monthly}</td>
                  <td>${PLANS[chosen].monthly}</td>
                </tr>
                <tr>
                  <th scope="row">One-time setup</th>
                  <td>${PILOT_SETUP_CENTS / 100}</td>
                  <td>${SETUP_CENTS / 100}</td>
                </tr>
                <tr>
                  <th scope="row">First payment</th>
                  <td>
                    <strong>
                      $
                      {(
                        PLANS[chosen].monthly +
                        PILOT_SETUP_CENTS / 100
                      ).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      $
                      {(
                        PLANS[chosen].monthly +
                        SETUP_CENTS / 100
                      ).toLocaleString()}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Then ${PLANS[chosen].monthly}/month.</strong> Setup does not
            repeat. Amounts are in USD, before tax and any extra minutes you
            authorize. You will see your confirmed setup price before paying.
          </p>
        </section>
        <p className="platform-note">
          Your allowance is measured in minutes; call counts are estimates. Each
          call rounds up separately. Extra minutes are 49¢, and disabled until
          you authorize a spending limit. Unused minutes expire at renewal. Each
          plan serves one business location. Payment is collected securely by
          Stripe.
        </p>
      </fieldset>
      <ul className="platform-note">
        {COMMON_FEATURES.map((f) => (
          <li key={f}>{f}</li>
        ))}
        <li>
          Up to {PLANS[chosen].teamLimit} bookable team members on this plan.
        </li>
      </ul>
      <fieldset>
        <legend>02 — Meet your business</legend>
        <div className="platform-fields">
          <label>
            Business name
            <input
              name="business_name"
              required
              maxLength={120}
              defaultValue={customer?.business_name}
            />
          </label>
          <label>
            Business type
            <select name="trade" defaultValue={c?.trade ?? "salon"}>
              <option value="salon">Salon, spa or wellness</option>
              <option value="studio">Creative studio</option>
              <option value="other">Other appointment business</option>
            </select>
          </label>
          <label>
            Business address
            <input
              name="address"
              required
              maxLength={300}
              defaultValue={c?.address}
            />
          </label>
          <label>
            Existing business phone number
            <input name="phone" type="tel" required defaultValue={c?.phone} />
          </label>
          <label>
            Preferred area code
            <input
              name="areaCode"
              required
              pattern="[2-9][0-9]{2}"
              placeholder="212"
              defaultValue={c?.areaCode}
            />
          </label>
          <label>
            Brand colour
            <input
              type="color"
              name="color"
              defaultValue={c?.color ?? "#234d59"}
              className="mt-3 h-11 w-24"
            />
          </label>
        </div>
        <p className="platform-note">
          We start with non-medical businesses. Medical workflows need a
          separate review before onboarding.
        </p>
      </fieldset>
      <PhoneProviderFields initial={c?.phoneSetup} />
      <fieldset>
        <legend>04 — When you’re open</legend>
        <label>
          Timezone
          <select
            name="timezone"
            defaultValue={c?.timezone ?? "America/New_York"}
          >
            {[
              "America/New_York",
              "America/Chicago",
              "America/Denver",
              "America/Los_Angeles",
              "America/Phoenix",
              "America/Anchorage",
              "Pacific/Honolulu",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <div className="platform-days">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <label key={d}>
              <input
                name="days"
                type="checkbox"
                value={i}
                defaultChecked={(c?.days ?? [1, 2, 3, 4, 5]).includes(i)}
              />
              {d}
            </label>
          ))}
        </div>
        <div className="platform-fields">
          <label>
            Opens
            <input
              name="opens"
              type="time"
              required
              defaultValue={c?.opens ?? "09:00"}
            />
          </label>
          <label>
            Closes
            <input
              name="closes"
              type="time"
              required
              defaultValue={c?.closes ?? "17:00"}
            />
          </label>
        </div>
        <p className="platform-note">
          These hours apply to your whole team. Clients can book up to 30 days
          ahead, with 90 minutes’ notice.
        </p>
      </fieldset>
      <fieldset>
        <legend>05 — Who clients can book</legend>
        {team.map((p, i) => (
          <div className="platform-team" key={p.id}>
            <div className="platform-fields">
              <label>
                Team member
                <input
                  required
                  value={p.name}
                  onChange={(e) =>
                    setTeam(
                      team.map((v, n) =>
                        n === i ? { ...v, name: e.target.value } : v,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Service
                <input
                  required
                  value={p.service}
                  placeholder="Haircut, consultation…"
                  onChange={(e) =>
                    setTeam(
                      team.map((v, n) =>
                        n === i ? { ...v, service: e.target.value } : v,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Appointment length
                <select
                  value={p.minutes}
                  onChange={(e) =>
                    setTeam(
                      team.map((v, n) =>
                        n === i ? { ...v, minutes: Number(e.target.value) } : v,
                      ),
                    )
                  }
                >
                  {[15, 30, 45, 60, 90, 120, 180, 240].map((n) => (
                    <option key={n} value={n}>
                      {n} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {team.length > 1 && (
              <button
                type="button"
                className="secondary mt-3"
                onClick={() => setTeam(team.filter((_, n) => n !== i))}
              >
                Remove {p.name || "member"}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="secondary mt-4"
          disabled={team.length >= 20}
          onClick={() =>
            setTeam([
              ...team,
              { id: crypto.randomUUID(), name: "", service: "", minutes: 30 },
            ])
          }
        >
          Add a team member +
        </button>
      </fieldset>
      {saved && (
        <p className="platform-success" role="status">
          Your business details are saved.
        </p>
      )}
      {error && (
        <p className="platform-error" role="alert">
          {error}
        </p>
      )}
      <button disabled={busy}>
        {busy ? "Saving your setup…" : "Save and continue to secure checkout →"}
      </button>
      <p className="platform-note">
        After payment, we prepare your booking page and phone line, test them
        with you, and email you when everything is live.
      </p>
    </form>
  );
}
