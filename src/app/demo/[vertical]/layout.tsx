import type { Metadata } from "next";
import { VerticalTheme } from "@/components/vertical-theme";
import { resolveVertical } from "@/verticals/resolve";

type Props = { children: React.ReactNode; params: Promise<{ vertical: string }> };

/** Each themed business gets its own title, description and share card. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await resolveVertical(params);
  const title = `${v.brand} · ${v.copy.meta.title}`;
  return {
    // `absolute` stops the root layout's "· AI Receptionist" template wrapping the business name.
    title: { absolute: title, template: `%s · ${v.brand}` },
    description: v.copy.meta.description,
    // Three fictional businesses with fictional staff should never rank.
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: v.brand,
      title,
      description: v.copy.meta.ogDescription,
    },
  };
}

export default async function DemoLayout({ children, params }: Props) {
  // An unknown slug 404s here, before any page under it renders.
  const v = await resolveVertical(params);
  return (
    <>
      <VerticalTheme slug={v.slug} />
      {children}
    </>
  );
}
