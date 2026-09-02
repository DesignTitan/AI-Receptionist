import { AnimateOnScroll } from "@/components/marketing/animate-on-scroll";
import { ProductFooter, ProductHeader } from "@/components/marketing/product-chrome";

/** Product pages render on the product palette — no data-vertical, no attribute to set. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <AnimateOnScroll />
      <ProductHeader />
      {children}
      <ProductFooter />
    </div>
  );
}
