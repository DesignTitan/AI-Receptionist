/** Permit the development server's loopback alias without trusting forwarded hosts. */
export function sameRequestOrigin(origin: string | null, url: string, host: string | null, development: boolean): boolean {
  if (!origin) return false;
  try {
    const submitted = new URL(origin);
    const target = new URL(url);
    if (origin === target.origin) return true;
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return development && origin === submitted.origin &&
      loopback.has(submitted.hostname) && loopback.has(target.hostname) &&
      submitted.protocol === target.protocol && submitted.port === target.port &&
      host === submitted.host;
  } catch { return false; }
}
