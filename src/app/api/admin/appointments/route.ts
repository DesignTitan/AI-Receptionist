import { NextResponse } from "next/server";
import { getDashboardStats, listAppointments } from "@/lib/db";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: (AppointmentStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
  "no_answer",
];

/** Feed behind the dashboard's live refresh. Protected by middleware. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as AppointmentStatus | "all" | null;
  const status = statusParam && STATUSES.includes(statusParam) ? statusParam : "all";

  const [appointments, stats] = await Promise.all([
    listAppointments({ status, search: searchParams.get("q") ?? undefined, limit: 200 }),
    getDashboardStats(),
  ]);

  return NextResponse.json({ appointments, stats, fetchedAt: new Date().toISOString() });
}
