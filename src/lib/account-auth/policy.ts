/** Pure policy helpers shared by routes and tests. Never trust decoded JWTs before provider verification. */
export function safeDestination(value: unknown): string {
  if (typeof value !== "string" || value.length > 1024 || value.includes("\\"))
    return "/account";
  try {
    const url = new URL(value, "https://local.invalid");
    if (
      url.origin !== "https://local.invalid" ||
      ![
        "/account",
        "/account/settings",
        "/account/security",
        "/start",
      ].includes(url.pathname)
    )
      return "/account";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/account";
  }
}
export function normalizeRecoveryCode(value: unknown): string {
  return typeof value === "string"
    ? value.toUpperCase().replace(/[\s-]/g, "")
    : "";
}
export function recentVerification(
  at: string | null,
  now = Date.now(),
): boolean {
  const elapsed = now - Date.parse(at ?? "");
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 10 * 60_000;
}
export function deviceLabel(agent: string): string {
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /Firefox\//.test(agent)
      ? "Firefox"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : "Browser";
  const system = /iPhone|iPad/.test(agent)
    ? "iOS"
    : /Android/.test(agent)
      ? "Android"
      : /Macintosh/.test(agent)
        ? "Mac"
        : /Windows/.test(agent)
          ? "Windows"
          : "device";
  return `${browser} on ${system}`;
}

/** Check only after the provider validates the assertion signature over these bytes. */
export function hasUserVerification(value: unknown): boolean {
  if (
    typeof value !== "string" ||
    value.length > 8192 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  )
    return false;
  const bytes = Buffer.from(value, "base64url");
  return bytes.length >= 37 && (bytes[32] & 0x04) !== 0;
}
