import type { RoadmapSeed } from "./types";

/** Customer-facing plans from ROADMAP.md, customer-platform.md and inbound-phone.md. */
export const ROADMAP: RoadmapSeed[] = [
  { id: "incoming-ai-booking", title: "Book appointments by phone", description: "Let customers book by phone, with caller choice and answering schedules you control.", status: "pilot" },
  { id: "calendar-booking-sync", title: "Connect your existing appointment book", description: "Keep bookings aligned with the calendar or booking software your business already uses.", status: "planned" },
  { id: "individual-team-availability", title: "Different hours for each team member", description: "Offer appointments around each person’s working days and availability.", status: "planned" },
  { id: "owner-business-editing", title: "Update your team and booking hours", description: "Change your team and business booking hours yourself as your business changes.", status: "planned" },
  { id: "service-menu-durations", title: "More services. The right appointment length.", description: "Offer a service menu with different durations for the appointments customers need.", status: "exploring" },
  { id: "multiple-locations", title: "Bring your locations together", description: "Manage appointment reception for more than one business location.", status: "planned" },
  { id: "multiple-phone-lines", title: "Give different calls their own line", description: "Add phone lines for different jobs, such as confirmations and incoming booking.", status: "planned" },
  { id: "appointment-reminder-calls", title: "Remind customers before their appointment", description: "Schedule a reminder call ahead of an upcoming appointment.", status: "exploring" },
  { id: "customer-reengagement-calls", title: "Invite customers back", description: "Follow up with customers who have opted in when it is time to book again.", status: "exploring" },
  { id: "appointment-changes-by-phone", title: "Change an appointment by phone", description: "Let callers request and complete an appointment change in the same conversation.", status: "exploring" },
  { id: "guided-self-serve-activation", title: "Get set up with fewer handoffs", description: "Move from signup to a working receptionist through a more complete guided setup.", status: "planned" },
  { id: "outgoing-voicemail-messages", title: "Leave a useful voicemail", description: "Leave an appointment message when a confirmation call reaches voicemail.", status: "planned" },
  { id: "referral-rewards", title: "Recommend us and earn rewards", description: "Share AI Receptionist with another business and track referral rewards from your dashboard.", status: "planned" },
];
