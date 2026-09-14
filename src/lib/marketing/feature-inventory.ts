/**
 * The complete, customer-facing feature inventory for /features.
 * Every item is labelled by what is true today: included on every plan, part of the
 * incoming-call pilot (a tested phone connection first), or on the public roadmap.
 * Roadmap ids match src/lib/roadmap/catalogue.ts so "coming soon" always points at a real item.
 */
export type FeatureStatus = "included" | "pilot" | "soon";

export type FeatureItem = { name: string; detail: string; status: FeatureStatus; roadmapId?: string };
export type FeatureGroup = { id: string; number: string; title: string; summary: string; storyId: string | null; items: FeatureItem[] };

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "booking", number: "01", title: "Online booking", storyId: "online-booking",
    summary: "A booking page in your name that takes appointments while you work.",
    items: [
      { name: "Your own booking page", detail: "Your business name, brand colour, team and appointment details.", status: "included" },
      { name: "Book by person and time", detail: "Customers choose a team member and an open slot.", status: "included" },
      { name: "Availability from your hours", detail: "Saved hours, service durations and existing bookings decide what is open.", status: "included" },
      { name: "Open after you close", detail: "Bookings come in overnight for appointments during your working hours.", status: "included" },
      { name: "Booking reference and confirmation page", detail: "Every booking is saved in your appointment book with a reference.", status: "included" },
      { name: "Different hours for each team member", detail: "Appointments around each person's working days.", status: "soon", roadmapId: "individual-team-availability" },
      { name: "Service menu with different lengths", detail: "The right appointment length for each service.", status: "soon", roadmapId: "service-menu-durations" },
    ],
  },
  {
    id: "confirmation", number: "02", title: "AI confirmation calls", storyId: "confirmation-calls",
    summary: "After a booking, your receptionist phones the customer to confirm.",
    items: [
      { name: "A call after every online booking", detail: "Placed once voice setup is active and within your minutes.", status: "included" },
      { name: "Recorded, and says so", detail: "The call opens with the recording notice.", status: "included" },
      { name: "Confirms, or captures a change", detail: "A clear cancellation updates the booking; a reschedule request goes to your team.", status: "included" },
      { name: "Calls from a dedicated number", detail: "Configured during setup, so customers see the same number each time.", status: "included" },
      { name: "On or off, independently", detail: "Confirmation calls are separate from incoming calls.", status: "included" },
      { name: "A useful voicemail message", detail: "An appointment message when the call reaches voicemail.", status: "soon", roadmapId: "outgoing-voicemail-messages" },
      { name: "Reminder calls before the appointment", detail: "A scheduled call ahead of the day.", status: "soon", roadmapId: "appointment-reminder-calls" },
    ],
  },
  {
    id: "incoming", number: "03", title: "Incoming phone booking", storyId: "incoming-calls",
    summary: "Customers who would rather call can book by phone. Pilot: your line is reviewed and tested first.",
    items: [
      { name: "Book by phone on your public number", detail: "The same appointment book as online bookings.", status: "pilot" },
      { name: "You choose who answers", detail: "A menu, your team first, AI first, or staff only.", status: "pilot" },
      { name: "Details read back before saving", detail: "Availability is checked and the booking confirmed in the conversation.", status: "pilot" },
      { name: "An answering schedule", detail: "Hours, holidays and temporary overrides in your timezone.", status: "pilot" },
      { name: "Staff or voicemail fallback", detail: "Callers who ask for a person follow the route you set.", status: "pilot" },
      { name: "Change an appointment by phone", detail: "Request and complete a change in the same call.", status: "soon", roadmapId: "appointment-changes-by-phone" },
    ],
  },
  {
    id: "records", number: "04", title: "Records and follow-up", storyId: "call-records",
    summary: "Every booking and every call, with what needs a person marked.",
    items: [
      { name: "One appointment book", detail: "Every booking, online or by phone, in one place.", status: "included" },
      { name: "Recording, transcript and summary", detail: "For each call, with the recording when the voice provider supplies it.", status: "included" },
      { name: "An outcome on every call", detail: "Confirmed, reschedule requested, cancelled or no answer.", status: "included" },
      { name: "Flagged for a person", detail: "No-answers and reschedule requests wait for your team.", status: "included" },
      { name: "Confirm or cancel from the dashboard", detail: "Pending bookings can be settled by hand.", status: "included" },
      { name: "Email notices", detail: "Booking and call notices, once email delivery is connected.", status: "included" },
      { name: "Incoming-call history", detail: "Including calls that do not end in a booking.", status: "pilot" },
      { name: "Connect your existing appointment book", detail: "Keep bookings aligned with the software you already use.", status: "soon", roadmapId: "calendar-booking-sync" },
    ],
  },
  {
    id: "usage", number: "05", title: "Usage and spending", storyId: "usage-controls",
    summary: "Included minutes, a cap you set, and no surprise bills.",
    items: [
      { name: "Included minutes on every plan", detail: "300, 750 or 1,500 started minutes a month.", status: "included" },
      { name: "Extra spending starts at zero", detail: "Opt in to a monthly cap of up to $500 when you want more.", status: "included" },
      { name: "Notices before you run out", detail: "At 80% and 100% of your allowance and near your cap.", status: "included" },
      { name: "Calling pauses, booking stays open", detail: "Out of minutes means manual confirmation, not lost bookings.", status: "included" },
      { name: "Every call capped at five minutes", detail: "Usage, renewal date and projected bill in your dashboard.", status: "included" },
      { name: "Compare plans from the dashboard", detail: "Move up when your month says so.", status: "included" },
    ],
  },
  {
    id: "setup", number: "06", title: "Setup and account", storyId: null,
    summary: "One setup, paid once, tested with you before anything goes live.",
    items: [
      { name: "Guided setup", detail: "Your business, team, hours and phone details.", status: "included" },
      { name: "A test session before activation", detail: "We check the booking page and the voice line with you.", status: "included" },
      { name: "One location per plan", detail: "US and Canadian phone numbers.", status: "included" },
      { name: "Email support", detail: "On every plan.", status: "included" },
      { name: "Update your team and hours yourself", detail: "Change details as your business changes.", status: "soon", roadmapId: "owner-business-editing" },
      { name: "More than one location", detail: "Reception for several locations in one account.", status: "soon", roadmapId: "multiple-locations" },
      { name: "More than one phone line", detail: "A line for each job.", status: "soon", roadmapId: "multiple-phone-lines" },
      { name: "Referral rewards", detail: "Recommend bubs™ and track rewards from your dashboard.", status: "soon", roadmapId: "referral-rewards" },
    ],
  },
];

export const STATUS_LABEL: Record<FeatureStatus, string> = { included: "Included", pilot: "Pilot", soon: "Coming soon" };

/** The three outcomes the page opens with; each points at the stories below. */
export const PILLARS = [
  { id: "get-booked", title: "Get booked", detail: "A booking page that works after hours, and a phone line that can take bookings too.", href: "#online-booking", groups: ["booking", "incoming"] },
  { id: "confirm-every-visit", title: "Confirm every visit", detail: "A call after each booking, with the recording, transcript and outcome kept for you.", href: "#confirmation-calls", groups: ["confirmation", "records"] },
  { id: "stay-in-control", title: "Stay in control", detail: "Included minutes, a cap you choose, and one setup tested with you before it goes live.", href: "#usage-controls", groups: ["usage", "setup"] },
];
