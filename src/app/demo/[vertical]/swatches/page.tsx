import { SwatchSheet } from "@/components/swatch-sheet";
import { resolveVertical } from "@/verticals/resolve";
export default async function DemoSwatches({ params }: { params: Promise<{ vertical: string }> }) {
  const v = await resolveVertical(params);
  return <SwatchSheet label={`${v.brand} palette`} />;
}
