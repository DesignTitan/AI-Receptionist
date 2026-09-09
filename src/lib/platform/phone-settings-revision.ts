import { createHash } from "node:crypto";

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(object).sort().map(key => [key, canonical(object[key])]));
  }
  return value;
}

/** JSONB may reorder object keys at every depth; array order and actual values still matter. */
export function phoneSettingsRevision(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonical(value ?? {}))).digest("hex");
}
