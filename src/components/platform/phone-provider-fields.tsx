"use client";
import { useState } from "react";
import { DEFAULT_PHONE_SETUP, PHONE_PROVIDERS, phoneSetupGuidance, type PhoneSetup } from "@/lib/platform/phone-provider";
export function PhoneProviderFields({ initial }: { initial?: PhoneSetup }) {
  const [setup, setSetup] = useState(initial ?? DEFAULT_PHONE_SETUP);
  return <fieldset>
    <legend>03 — Your phone and appointment book</legend>
    <p>Tell us about the number your customers already call. We’ll prepare the right connection steps for your service.</p>
    <div className="platform-fields">
      <label>Phone provider
        <select name="phoneProvider" value={setup.provider} onChange={e => setSetup({ ...setup, provider: e.target.value as PhoneSetup["provider"] })}>
          {Object.entries(PHONE_PROVIDERS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label>Type of phone service
        <select name="phoneServiceType" value={setup.serviceType} onChange={e => setSetup({ ...setup, serviceType: e.target.value as PhoneSetup["serviceType"] })}>
          <option value="unknown">Not sure yet</option><option value="business_line">Business phone line</option><option value="cloud_phone">Cloud phone system / office extensions</option><option value="mobile">Mobile phone</option>
        </select>
      </label>
      <label>{setup.provider === "other" ? "Provider and plan name" : "Service or plan name (if known)"}
        <input name="phoneServiceName" maxLength={160} defaultValue={initial?.serviceName ?? ""} placeholder={setup.provider === "comcast" ? "For example, Business VoiceEdge" : "The name shown on your phone bill"} />
      </label>
      <label>Where do you manage appointments?
        <input name="bookingSystem" maxLength={160} defaultValue={initial?.bookingSystem ?? ""} placeholder="Software name, paper calendar, or not sure" />
      </label>
    </div>
    <p className="platform-note" role="status">{phoneSetupGuidance(setup)}</p>
    <p className="platform-note">Selecting a provider saves your setup details. Incoming AI booking becomes available after your phone connection and appointment book have been reviewed and tested. Existing booking-software connections require a compatibility check.</p>
  </fieldset>;
}
