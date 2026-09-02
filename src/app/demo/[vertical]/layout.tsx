import type { Metadata } from "next";
import { VerticalTheme } from "@/components/vertical-theme";
import { notFound } from "next/navigation";
import { resolveVertical } from "@/verticals/resolve";
import { TENANT_SLUG } from "@/verticals/slugs";

type Props = { children: React.ReactNode; params: Promise<{ vertical: string }> };

/** Each themed business gets its own title, description and share card. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await resolveVertical(params);
  const title = `${v.brand} · ${v.copy.meta.title}`;
  return {
    // `absolute` stops the root layout's "· AI Receptionist" template wrapping the business name.
    title: { absolute: title, template: `%s · ${v.brand}` },
    description: v.copy.meta.description,
    // Fictional demo businesses should never rank; a customer's own site should.
    ...(TENANT_SLUG ? {} : { robots: { index: false, follow: false } }),
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
  if (TENANT_SLUG && v.slug !== TENANT_SLUG) notFound();
  return (
    <>
      <VerticalTheme slug={v.slug} />
      {children}
    </>
  );
}
