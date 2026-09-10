export class RoadmapRequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export async function roadmapBody(request: Request): Promise<Record<string, unknown>> {
  // Next can normalize the internal URL to localhost. The browser's Host still
  // identifies the requested site; do not trust a supplied forwarded host.
  const url = new URL(request.url);
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https" ? `${forwardedProtocol}:` : url.protocol;
  const host = request.headers.get("host") ?? url.host;
  const expectedOrigin = `${protocol}//${host}`;
  if (request.headers.get("origin") !== expectedOrigin)
    throw new RoadmapRequestError("Please send feedback from this website.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    throw new RoadmapRequestError("Please send a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new RoadmapRequestError("Your request is empty.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new RoadmapRequestError("Please keep your suggestion short.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw Error();
    return value as Record<string, unknown>;
  } catch { throw new RoadmapRequestError("Please check your request and try again."); }
}

export function suggestionText(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string") throw new RoadmapRequestError(`Add ${label.toLowerCase()}.`);
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < min || text.length > max)
    throw new RoadmapRequestError(`${label} must be ${min}–${max} characters.`);
  return text;
}
