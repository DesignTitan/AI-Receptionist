import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { LogOut, PulseMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line surface-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-ink text-bg">
            <PulseMark width={19} height={19} strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-ink">
              Front desk
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
              {subtitle ?? "AI Receptionist"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden h-9 items-center rounded-full border border-line px-4 text-[13px] font-medium text-muted transition hover:text-ink sm:inline-flex"
          >
            View site
          </Link>
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-line-strong hover:text-ink"
              aria-label="Sign out"
            >
              <LogOut width={17} height={17} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

/** Small banner explaining what is (and isn't) wired up in this deployment. */
export function ModeBanner({
  supabase,
  voice,
  email,
}: {
  supabase: boolean;
  voice: string;
  email: boolean;
}) {
  const notes: string[] = [];
  if (!supabase) notes.push("in-memory data (no Supabase keys)");
  if (voice === "demo") notes.push("simulated calls");
  if (!email) notes.push("emails logged to the console");
  if (notes.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-dashed border-line bg-surface-2/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
      <span className="font-semibold text-ink">Demo mode.</span> Running with {notes.join(", ")}.
      Everything here is live and functional — see <code>.env.example</code> to connect the real
      services.
    </div>
  );
}
