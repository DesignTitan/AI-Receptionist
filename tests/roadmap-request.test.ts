import test from "node:test";
import assert from "node:assert/strict";
import { roadmapBody, RoadmapRequestError, suggestionText } from "../src/lib/roadmap/request.ts";

const request = (body: string, origin = "http://127.0.0.1:3101", type = "application/json") => new Request("http://127.0.0.1:3101/api/roadmap", { method: "POST", headers: { origin, "content-type": type }, body });

test("feedback writes require the same origin and JSON", async () => {
  await assert.rejects(roadmapBody(request("{}", "https://another.example")), (e: unknown) => e instanceof RoadmapRequestError && e.status === 403);
  await assert.rejects(roadmapBody(request("{}", "http://127.0.0.1:3101", "text/plain")), (e: unknown) => e instanceof RoadmapRequestError && e.status === 415);
  assert.deepEqual(await roadmapBody(request('{"action":"vote"}')), { action: "vote" });
});
test("feedback rejects malformed, non-object and oversized payloads", async () => {
  for (const body of ["null", "[]", "true", "{"]) await assert.rejects(roadmapBody(request(body)), RoadmapRequestError);
  await assert.rejects(roadmapBody(request(JSON.stringify({ title: "x".repeat(4100) }))), (e: unknown) => e instanceof RoadmapRequestError && e.status === 413);
});
test("origin checks use the browser-facing host across Next URL normalization", async () => {
  const normalized = (origin: string, extra: Record<string, string> = {}) => new Request("http://localhost:3101/api/roadmap", {
    method: "POST", body: "{}", headers: { origin, host: "127.0.0.1:3101", "content-type": "application/json", ...extra },
  });
  assert.deepEqual(await roadmapBody(normalized("http://127.0.0.1:3101")), {});
  for (const origin of ["http://localhost:3101", "http://127.0.0.1:3102", "https://attacker.example", "null", ""]) {
    await assert.rejects(roadmapBody(normalized(origin)), (e: unknown) => e instanceof RoadmapRequestError && e.status === 403);
  }
  await assert.rejects(roadmapBody(normalized("https://attacker.example", { "x-forwarded-host": "attacker.example", "x-forwarded-proto": "https" })), RoadmapRequestError);
  assert.deepEqual(await roadmapBody(normalized("https://receptionist.example", { host: "receptionist.example", "x-forwarded-proto": "https" })), {});
});
test("suggestions normalize spacing and enforce useful lengths", () => {
  assert.equal(suggestionText("  More   appointment choices  ", "Feature name", 5, 100), "More appointment choices");
  for (const value of [null, {}, "four", "x".repeat(101)]) assert.throws(() => suggestionText(value, "Feature name", 5, 100), RoadmapRequestError);
});
