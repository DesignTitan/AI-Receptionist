/// <reference types="react/canary" />
import { ViewTransition } from "react";

/** The route boundary changes; shared layouts and form state stay untouched. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition name="site-page" share="page-dissolve" enter="page-arrive" exit="page-leave" update="none">
      <div className="site-page-transition">{children}</div>
    </ViewTransition>
  );
}
