import { AnimateOnScroll } from "@/components/marketing/animate-on-scroll";

/** Product pages render on the product palette. Chrome is per page: the homepage is a chaptered editorial with a margin folio; /demos keeps the product bar. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimateOnScroll />
      {children}
    </>
  );
}
