import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { normalizeRecoveryCode } from "./policy";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const secret = () => randomBytes(32).toString("base64url");
function key() {
  const value = process.env.AUTH_SESSION_ENCRYPTION_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value))
    throw Error("Account security is not configured.");
  return Buffer.from(value, "hex");
}
export function seal(value: string): string {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}
export function unseal(value: string): string {
  const bytes = Buffer.from(value, "base64url"),
    decipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([
    decipher.update(bytes.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
export const recoveryHash = (userId: string, value: string) =>
  digest(`${userId}:${normalizeRecoveryCode(value)}`);
export function recoveryCodes() {
  return Array.from({ length: 10 }, () =>
    randomBytes(12)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,6}/g)!
      .join("-"),
  );
}
