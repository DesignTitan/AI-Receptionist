import { notFound } from "next/navigation";
import { findVertical } from "./index";

/**
 * The vertical named by a `/demo/[vertical]` URL, or a 404. Kept out of
 * `./index` so the registry never pulls `next/navigation` into a bundle.
 */
export async function resolveVertical(params: Promise<{ vertical: string }>) {
  const v = findVertical((await params).vertical);
  if (!v) notFound();
  return v;
}
