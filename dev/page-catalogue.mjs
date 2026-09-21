// Shared by the local toolbar and directory. This module is never a public asset.
const VERTICALS = [
  { slug: "medical", label: "Medical", provider: "elena-vasquez" },
  { slug: "salon", label: "Salon", provider: "sasha-reyes" },
  { slug: "studio", label: "Studio", provider: "mira-castellanos" },
];

function page(id, label, href, group, kind, access, description, sources) {
  return { id, label, href, group, kind, access, description, sources };
}

export function getPages({ tenant = "", siteGate = "public" } = {}) {
  const selected = VERTICALS.find((vertical) => vertical.slug === tenant);
  const verticals = selected ? [selected] : VERTICALS;
  const pages = selected ? [] : [
    page("marketing", "Marketing homepage", "/home", "Marketing", "app", "public",
      "Product overview, benefits and pricing.", ["src/app/(marketing)/page.tsx", "src/lib/platform/pricing.ts"]),
    page("splash", "Splash / coming soon", "/coming-soon", "Marketing", "app", "public",
      "Pre-launch splash page and founding-rate signup, separate from the full marketing site.", ["src/app/(holding)/coming-soon/page.tsx"]),
    page("features", "Features & benefits", "/features", "Marketing", "app", "public",
      "Online booking, AI calls, owner controls and the Coming Soon roadmap with feature voting.",
      ["src/app/(marketing)/features/page.tsx", "src/components/marketing/roadmap-board.tsx", "src/lib/platform/pricing.ts"]),
    page("demos", "Explore demos", "/demos", "Marketing", "app", "public",
      "Public demo directory: choose an interactive medical, salon or studio example. Individual demo screens are listed under Application.", ["src/app/(marketing)/demos/page.tsx"]),
    page("start", "Sign up & pricing", "/start", "Customer", "app", "public",
      "Name, email verification and purchase review before Stripe checkout.",
      ["src/app/start/page.tsx", "src/components/platform/start-form.tsx", "src/lib/platform/pricing.ts"]),
    page("payment-confirmation", "Welcome & business setup", "/account?preview=confirmation", "Customer", "app", "development",
      "Welcome, business details, weekly hours and setup review in one page. Working local preview with autosaved example data.",
      ["src/components/platform/purchase-welcome.tsx", "src/components/platform/purchase-welcome.module.css"]),
    page("account-settings", "Account settings", "/account/settings?preview=settings", "Customer", "app", "development",
      "Editable business details, weekly availability and phone preferences, plus profile, sign-in and billing. Preview shares saved setup details.", ["src/app/account/settings/page.tsx", "src/components/platform/account-settings.tsx", "src/components/platform/business-preferences-form.tsx", "src/components/platform/weekly-hours-editor.tsx"]),
    page("setup-hours-team", "Hours & availability", "/account?preview=confirmation#hours-team", "Customer", "app", "development", "Weekly hours editor with draggable handles, manual times and all-day controls.", ["src/components/platform/business-setup-form.tsx"]),
    page("setup-review", "Review & setup", "/account?preview=confirmation#review-setup", "Customer", "app", "development", "Working step 3: edit summaries and send for setup. Local sample data.", ["src/components/platform/business-setup-form.tsx"]),
    page("account", "Owner dashboard", "/account", "Customer", "app", "owner",
      "Bookings, call outcomes, usage and billing for the signed-in owner.", ["src/app/account/page.tsx"]),
    page("owner-signup", "Create an account", "/account/signup?plan=busy&preview=signup", "Customer", "app", "development",
      "Separate signup screen with name, email and selected plan. Continues to verification, account security and purchase review.", ["src/app/account/signup/page.tsx", "src/components/account-auth/auth-flow.tsx"]),
    page("owner-login", "Owner sign in", "/account/login", "Customer", "app", "public",
      "Secure email sign-in and passkeys. Enrollment, recovery and device controls are included below; live use requires configured account security.", ["src/app/account/login/page.tsx", "src/components/account-auth/auth-flow.tsx", "src/app/api/account/auth/route.ts"]),
  ];
  if (!selected) {
    const states = [
      ["signin", "Sign-in design"], ["email", "Check your email"], ["verify", "Verify your identity"],
      ["enroll", "Secure your account"], ["passkey", "Add a passkey"], ["authenticator", "Connect an authenticator"],
      ["codes", "Save recovery codes"], ["recovery", "Use a recovery code"], ["pending", "Recovery request"],
      ["expired", "Expired sign-in link"], ["settings", "Sign-in & security"], ["devices", "Sign out other devices"],
    ];
    for (const [state, label] of states) pages.push(page(`auth-${state}`, label, `/account/login?preview=${state}`, "Customer", "app", "development",
      "Authentication screen preview with example details. Real security changes require sign-in and configured Supabase authentication.",
      ["src/components/account-auth/auth-flow.tsx", "src/components/account-auth/auth.module.css", "src/app/api/account/auth/route.ts"]));
    pages.push(page("account-security", "Account security (signed in)", "/account/security", "Customer", "app", "owner",
      "Manage verified sign-in methods, one-time recovery codes and revocable sessions.", ["src/app/account/security/page.tsx", "src/app/api/account/auth/route.ts"]));

  }
  for (const vertical of verticals) {
    pages.push(page(`${vertical.slug}-home`, `${vertical.label} homepage`, selected ? "/" : `/demo/${vertical.slug}`,
      "Business demos", "app", "public", `Example ${vertical.slug} business homepage and provider directory.`,
      ["src/app/demo/[vertical]/page.tsx", `src/verticals/${vertical.slug}/index.ts`, `src/verticals/${vertical.slug}/roster.ts`]));
  }
  for (const vertical of verticals) {
    pages.push(page(`${vertical.slug}-booking`, `${vertical.label} booking`,
      `${selected ? "" : `/demo/${vertical.slug}`}/book/${vertical.provider}`, "Booking pages", "app", "public",
      `Choose an appointment with the featured ${vertical.slug} demo provider.`,
      ["src/app/demo/[vertical]/book/[slug]/page.tsx", "src/components/booking-flow.tsx",
        `src/verticals/${vertical.slug}/index.ts`, `src/verticals/${vertical.slug}/roster.ts`]));
  }
  pages.push(
    page("staff-appointments", "Appointments", "/admin", "Staff", "app", "staff",
      "Staff appointment list and call follow-up.", ["src/app/admin/page.tsx"]),
    page("staff-customers", "Customers", "/admin/customers", "Staff", "app", "staff",
      "Staff customer setup, billing and usage controls.", ["src/app/admin/customers/page.tsx"]),
    page("staff-roadmap", "Feature suggestions", "/admin/roadmap", "Staff", "app", "staff",
      "Review ideas before opening them for public roadmap voting.", ["src/app/admin/roadmap/page.tsx", "src/components/admin/roadmap-review.tsx"]),
    page("account-recovery-queue", "Account recovery requests", "/admin/account-recovery", "Staff", "app", "staff",
      "Review recovery requests. Reviewing or closing a request never unlocks an account or resets a sign-in method.", ["src/app/admin/account-recovery/page.tsx"]),
    page("staff-login", "Staff sign in", "/admin/login", "Staff", "app", "public",
      "Sign in to the staff area.", ["src/app/admin/login/page.tsx"]),
    page("character-sheets", "Mascot character sheets", "/__dev/design/multi-industry-v1/character-sheets.html", "Design studies", "study", "development",
      "Existing mascot model, expression and personality reference sheets.", ["design/hero-comparison/multi-industry-v1/character-sheets.html"]),
    page("cast-sheets", "Happy Paws cast sheets", "/__dev/design/multi-industry-v1/cast-sheets.html", "Design studies", "study", "development",
      "Character references for the groomer, dogs and caller in the Happy Paws campaign.", ["design/hero-comparison/multi-industry-v1/cast-sheets.html"]),
    page("mascot-studio", "3D mascot studio", "/__dev/design/mascot-3d/index.html", "Design studies", "study", "development",
      "Editable furry mascot prototype: rotate, blink, greet and follow the cursor. Blender master and animated GLB.",
      ["design/mascot-3d/build.py", "design/hero-comparison/mascot-3d/index.html", "design/hero-comparison/mascot-3d/studio.js"]),
    page("study-original", "Original four concepts", "/__dev/design/", "Design studies", "study", "development",
      "The first four hero directions, kept for comparison.",
      ["design/hero-comparison/index.html", "design/hero-comparison/docs/hero-comparison-copy.json"]),
    page("study-human", "Higgsfield photograph · V3", "/__dev/design/higgsfield-v3/", "Design studies", "study", "development",
      "The human photograph study awaiting creative approval.",
      ["scripts/dev-preview.mjs", "design/hero-comparison/higgsfield-v3/assets/coastal-break-cinema-2-5-clean.png"]),
    page("campaign-images", "Images & videos", "/__dev/design/campaign-v4/", "Marketing", "study", "development",
      "A simple canvas of campaign photos and the Happy Paws video.",
      ["design/hero-comparison/campaign-v4/index.html", "design/hero-comparison/campaign-v4/requests.json"]),
    page("visual-design-system", "Visual design system", "/__dev/design-system", "Internal tools", "internal", "development",
      "Brand colours, typography, spacing and interactive component examples.", ["dev/design-system.html", "src/components/brand/brand.css"]),
    page("marketing-roadmap", "Marketing roadmap", "/__dev/pages?view=roadmap", "Internal tools", "internal", "development",
      "Marketing phases, review tasks and saved completion progress.", ["dev/pages.js", "dev/pages.html"]),
    page("page-index", "Page index", "/__dev/pages", "Internal tools", "internal", "development",
      "Browse project pages, design studies and their source update dates.", ["dev/pages.html", "dev/pages.js"]),
    page("user-journey", "User journey", "/__dev/journey", "Internal tools", "internal", "development",
      "Explore the product journey from setup to booking and follow-up.", ["dev/journey.html", "dev/journey.js"]),
  );
  if (typeof siteGate === "string" && siteGate.trim().toLowerCase() === "locked") {
    pages.push(page("site-login", "Site sign in", "/login", "Internal tools", "app", "site-gate",
      "Unlock the site's access gate; owner and staff sign-in still apply.", ["src/app/login/page.tsx"]));
  }
  return pages;
}
