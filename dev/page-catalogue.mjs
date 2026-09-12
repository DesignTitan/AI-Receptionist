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
    page("marketing", "Marketing homepage", "/", "Marketing", "app", "public",
      "Product overview, benefits and pricing.", ["src/app/(marketing)/page.tsx", "src/lib/platform/pricing.ts"]),
    page("features", "Features & benefits", "/features", "Marketing", "app", "public",
      "Online booking, AI calls, owner controls and the Coming Soon roadmap with feature voting.",
      ["src/app/(marketing)/features/page.tsx", "src/components/marketing/roadmap-board.tsx", "src/lib/platform/pricing.ts"]),
    page("demos", "Demo overview", "/demos", "Marketing", "app", "public",
      "Choose a medical, salon or studio example.", ["src/app/(marketing)/demos/page.tsx"]),
    page("start", "Sign up & pricing", "/start", "Customer", "app", "public",
      "Name, email verification and purchase review before Stripe checkout.",
      ["src/app/start/page.tsx", "src/components/platform/start-form.tsx", "src/lib/platform/pricing.ts"]),
    page("payment-confirmation", "Payment confirmation", "/account?preview=confirmation", "Customer", "app", "development",
      "Working payment-confirmation page with illustrative details. No sign-in needed for this local design preview.",
      ["src/components/platform/purchase-welcome.tsx", "src/components/platform/purchase-welcome.module.css"]),
    page("account-settings", "Account settings", "/account/settings?preview=settings", "Customer", "app", "development",
      "Profile, sign-in, billing, notifications and account controls. Local preview uses example details.", ["src/app/account/settings/page.tsx", "src/components/platform/account-settings.tsx"]),
    page("account", "Owner dashboard", "/account", "Customer", "app", "owner",
      "Bookings, call outcomes, usage and billing for the signed-in owner.", ["src/app/account/page.tsx"]),
    page("owner-login", "Owner sign in", "/account/login", "Customer", "app", "public",
      "Sign in to a business owner account.", ["src/app/account/login/page.tsx"]),
  ];
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
    page("staff-login", "Staff sign in", "/admin/login", "Staff", "app", "public",
      "Sign in to the staff area.", ["src/app/admin/login/page.tsx"]),
    page("study-original", "Original four concepts", "/__dev/design/", "Design studies", "study", "development",
      "The first four hero directions, kept for comparison.",
      ["design/hero-comparison/index.html", "design/hero-comparison/docs/hero-comparison-copy.json"]),
    page("study-luxury", "Marketing site · V2", "/__dev/design/luxury-v2/", "Marketing", "study", "development",
      "The preferred V2 marketing preview with the SpaceX/Starlink-inspired time-back direction.",
      ["design/hero-comparison/luxury-v2/index.html", "design/hero-comparison/luxury-v2/docs/copy.json"]),
    page("study-human", "Higgsfield photograph · V3", "/__dev/design/higgsfield-v3/", "Design studies", "study", "development",
      "The human photograph study awaiting creative approval.",
      ["scripts/dev-preview.mjs", "design/hero-comparison/higgsfield-v3/assets/coastal-break-cinema-2-5-clean.png"]),
    page("campaign-images", "Marketing assets", "/__dev/design/campaign-v4/", "Marketing", "study", "development",
      "Happy Paws first-cut video, multi-industry production storyboard and ten Higgsfield photographs.",
      ["design/hero-comparison/campaign-v4/index.html", "design/hero-comparison/campaign-v4/requests.json"]),
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
