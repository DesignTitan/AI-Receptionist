"use client";

import { createElement } from "react";
import { usePathname } from "next/navigation";

/** Also update the shared toolbar when Next navigates without reloading the page. */
export default function ToolbarLocation({ tenant, siteGate }: { tenant: string; siteGate: string }) {
  return createElement("ai-dev-toolbar", {
    tenant,
    "site-gate": siteGate,
    pathname: usePathname(),
  });
}
