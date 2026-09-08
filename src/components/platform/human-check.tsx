"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
export function HumanCheck({
  siteKey,
  onToken,
  reset = 0,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  reset?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const widget = useRef<string | null>(null);
  function render() {
    const t = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (!t || !el.current || widget.current) return;
    widget.current = t.render(el.current, {
      sitekey: siteKey,
      callback: (v: string) => callback.current(v),
      "expired-callback": () => callback.current(""),
      "error-callback": () => callback.current(""),
    });
  }
  useEffect(() => {
    render();
    return () => {
      const t = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (t && widget.current) t.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, reset]);
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={render}
      />
      <div ref={el} className="mt-5" />
    </>
  );
}
