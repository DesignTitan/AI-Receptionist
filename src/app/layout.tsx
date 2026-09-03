import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans, Instrument_Serif, Playfair_Display, Space_Grotesk } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * One display face per vertical. next/font can't be called conditionally, so
 * every face loads here under its own variable and globals.css re-points
 * `--font-display` at the right one under `[data-vertical]`. Browsers only
 * fetch a face that rendered text actually matches, so an inactive vertical's
 * font costs a few hundred bytes of @font-face CSS and no download.
 */
const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display-editorial",
  display: "swap",
  preload: false,
});
const fashion = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display-fashion",
  display: "swap",
  preload: false,
});
/** The marketing homepage's display face: a clean grotesk, after the owner turned down the serif. */
const marketing = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-marketing",
  display: "swap",
  preload: false,
});
const technical = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-technical",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "AI Receptionist", template: "%s · AI Receptionist" },
  description:
    "An AI front desk for any business that takes bookings: online booking, a confirmation call within a minute, and every call logged where the owner can see it.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b12" },
  ],
};

/** Applies the stored theme before first paint to avoid a flash. */
const themeScript = `
try {
  var stored = localStorage.getItem('theme');
  var dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Font variables sit on <html> alongside the theme class and the
    // data-vertical attribute, so `--font-display: var(--font-display-…)`
    // resolves on the same element it is declared on.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${editorial.variable} ${fashion.variable} ${technical.variable} ${marketing.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
