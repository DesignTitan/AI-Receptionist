import type { PhoneMode, PhoneSettings } from "./phone-settings.ts";

export type CallStage = "arrival" | "selection" | "staff_unavailable";
export type RoutingInstruction = {
  action: "menu" | "staff" | "ai" | "voicemail";
  reason: string;
  number?: string;
  ringSeconds?: number;
  prompt?: string;
};
function staff(settings: PhoneSettings, reason: string): RoutingInstruction {
  return settings.staffNumber
    ? { action: "staff", number: settings.staffNumber, ringSeconds: settings.ringSeconds, reason }
    : { action: "voicemail", reason: "staff_destination_unavailable" };
}
/** Off and staff-only have no route back to AI. A failed staff transfer is never retried in a loop. */
export function routeInboundCall(settings: PhoneSettings, mode: PhoneMode | "off", stage: CallStage, choice?: string, requestedStaff = false): RoutingInstruction {
  if (mode === "off" || mode === "staff_only") {
    return stage === "staff_unavailable" ? { action: "voicemail", reason: "staff_unavailable" } : staff(settings, mode);
  }
  if (stage === "staff_unavailable") {
    return !requestedStaff && settings.noAnswerAction === "ai"
      ? { action: "ai", reason: "staff_did_not_answer" }
      : { action: "voicemail", reason: requestedStaff ? "staff_callback_requested" : "staff_unavailable" };
  }
  // A caller can request a person even during AI-first answering.
  if (stage === "selection" && choice === "2") return staff(settings, "caller_requested_staff");
  if (mode === "menu") {
    if (stage === "selection") return choice === "1"
      ? { action: "ai", reason: "caller_selected_booking" }
      : { action: "voicemail", reason: "no_valid_menu_selection" };
    return { action: "menu", reason: "menu_first", prompt: settings.staffNumber
      ? "To book with our AI receptionist, press 1. To speak with the front desk, press 2."
      : "To book with our AI receptionist, press 1. To leave a message for the front desk, press 2." };
  }
  if (mode === "staff_first") return staff(settings, "staff_first");
  return { action: "ai", reason: "ai_first" };
}
export function unavailableRoute(settings: PhoneSettings, stage: CallStage, reason: string): RoutingInstruction {
  return settings.fallback === "staff" && stage !== "staff_unavailable"
    ? staff(settings, reason)
    : { action: "voicemail", reason };
}
