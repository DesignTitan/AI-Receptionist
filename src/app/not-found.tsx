import { ArrowRight } from "@/components/icons";
import { ProductFooter, ProductHeader } from "@/components/marketing/product-chrome";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ProductHeader />
      <main id="main" className="relative grid flex-1 place-items-center px-5 py-24">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="max-w-md text-center">
          <p className="font-display text-6xl text-primary">404</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            The link may be out of date, or a booking reference may not match. The live demos are
            a good place to start again.
          </p>
          <Button href="/demos" size="md" className="mt-7">
            See the demos
            <ArrowRight width={17} height={17} />
          </Button>
        </div>
      </main>
      <ProductFooter />
    </div>
  );
}
