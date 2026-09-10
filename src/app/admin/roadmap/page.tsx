import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/shell";
import { RoadmapReview } from "@/components/admin/roadmap-review";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Feature suggestions", robots: { index: false, follow: false } };

export default function RoadmapAdminPage() {
  return <div className="min-h-dvh bg-bg text-ink">
    <AdminHeader subtitle="Feature suggestions" />
    <main id="main" className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-xs uppercase tracking-widest text-subtle">Product feedback</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">Help shape what comes next.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">Review new ideas before they appear on the public roadmap. Approving an idea opens it for voting; it does not promise a release date. Check for duplicates and personal information before approving.</p>
      <Link href="/features#coming-soon" className="mt-5 inline-block border-b border-current pb-1 text-sm">View the public roadmap ↗</Link>
      <RoadmapReview />
    </main>
  </div>;
}
