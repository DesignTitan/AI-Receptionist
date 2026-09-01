import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/dashboard";
import { AdminHeader, ModeBanner } from "@/components/admin/shell";
import { getDashboardStats, listAppointments } from "@/lib/db";
import { emailStatus } from "@/lib/email";
import { env, isSupabaseConfigured, isVoiceProviderConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointments",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [appointments, stats] = await Promise.all([
    listAppointments({ limit: 200 }),
    getDashboardStats(),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />
      <main id="main" className="mx-auto max-w-7xl px-5 py-8">
        <ModeBanner
          supabase={isSupabaseConfigured()}
          voice={isVoiceProviderConfigured() ? env.voiceProvider : "demo"}
          email={emailStatus().configured}
        />
        <Dashboard initial={{ appointments, stats }} timezone={env.timezone} />
      </main>
    </div>
  );
}
