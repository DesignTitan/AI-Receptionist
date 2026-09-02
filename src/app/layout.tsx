import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { env } from "@/lib/env";
import { DEFAULT_VERTICAL as v } from "@/verticals";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${v.brand} · ${v.copy.meta.title}`,
    template: `%s · ${v.brand}`,
  },
  description: v.copy.meta.description,
  openGraph: {
    type: "website",
    siteName: v.brand,
    title: `${v.brand} · ${v.copy.meta.title}`,
    description: v.copy.meta.ogDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#060d11" },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${display.variable} antialiased`}>
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
