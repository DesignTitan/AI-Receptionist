export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "no_answer";

export type CallStatus =
  | "queued"
  | "ringing"
  | "in_progress"
  | "completed"
  | "failed";

export type CallOutcome =
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "voicemail"
  | "no_answer"
  | "failed"
  | null;

export type Doctor = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialty: string;
  bio: string;
  photo_url: string;
  years_experience: number;
  rating: number;
  reviews_count: number;
  languages: string[];
  education: string;
  consultation_fee: number;
  location: string;
  /** 0 = Sunday … 6 = Saturday */
  working_days: number[];
  /** "HH:MM" in the clinic timezone */
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
};

export type Patient = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  reference: string;
  doctor_id: string;
  patient_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  status: AppointmentStatus;
  is_new_patient: boolean;
  created_at: string;
  updated_at: string;
};

export type CallLog = {
  id: string;
  appointment_id: string;
  patient_id: string;
  provider: string;
  provider_call_id: string | null;
  direction: "outbound" | "inbound";
  status: CallStatus;
  outcome: CallOutcome;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
  duration_seconds: number | null;
  cost: number | null;
  error: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export type NotificationLog = {
  id: string;
  appointment_id: string | null;
  channel: "email";
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "logged";
  error: string | null;
  created_at: string;
};

/** An appointment joined with its doctor, patient and most recent call. */
export type AppointmentDetail = Appointment & {
  doctor: Doctor | null;
  patient: Patient | null;
  call: CallLog | null;
};

export type Slot = {
  /** ISO start instant */
  start: string;
  end: string;
  /** "9:00 AM" rendered in the clinic timezone */
  label: string;
  available: boolean;
};
