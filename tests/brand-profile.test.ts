import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateBrandProfile } from "@/lib/platform/brand-profile";

describe("brand profile validation", () => {
  it("accepts a minimal valid profile", () => {
    const result = validateBrandProfile({
      businessName: "Willow Studio",
      whatYouDo: "Neighborhood dog grooming",
      timezone: "America/Detroit",
      weeklyHours: [
        { day: 1, enabled: true, opens: "09:00", closes: "17:00" },
        { day: 2, enabled: true, opens: "09:00", closes: "17:00" },
        { day: 3, enabled: true, opens: "09:00", closes: "17:00" },
        { day: 4, enabled: true, opens: "09:00", closes: "17:00" },
        { day: 5, enabled: true, opens: "09:00", closes: "17:00" },
        { day: 0, enabled: false, opens: "00:00", closes: "24:00" },
        { day: 6, enabled: false, opens: "00:00", closes: "24:00" },
      ],
      phoneToAnswer: "(313) 555-0142",
      escalateTo: { name: "Alex Morgan", phone: "313-555-0177" },
      topCallTypes: ["Book appointment", "Reschedule"],
      bookVsMessage: "book_when_possible",
      greetingName: "Willow Studio",
      faqs: { price: "No phone quotes", serviceArea: "Midtown & Downtown" },
    });
    assert.equal(result.phoneToAnswer, "+13135550142");
    assert.equal(result.escalateTo.phone, "+13135550177");
  });

  it("rejects missing call types", () => {
    assert.throws(() =>
      validateBrandProfile({
        businessName: "X",
        whatYouDo: "Y",
        timezone: "America/New_York",
        phoneToAnswer: "+13135550142",
        escalateTo: { name: "Z", phone: "+13135550177" },
        topCallTypes: [],
        bookVsMessage: "book_when_possible",
        greetingName: "X",
        faqs: { price: "", serviceArea: "" },
      }),
    );
  });
});

