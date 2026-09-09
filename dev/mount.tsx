import Script from "next/script";
import { env } from "@/lib/env";
import { TENANT_SLUG } from "@/verticals/slugs";
import ToolbarLocation from "./location";

/** This module is resolved only by the development server, never by next build. */
export default function DevelopmentTools() {
  return <>
    <ToolbarLocation tenant={TENANT_SLUG ?? ""} siteGate={env.siteGate} />
    <Script src="/__dev/toolbar.js" type="module" strategy="afterInteractive" />
  </>;
}
