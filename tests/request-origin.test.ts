import test from "node:test";
import assert from "node:assert/strict";
import { sameRequestOrigin } from "../src/lib/platform/request-origin.ts";
test("same-origin submissions work in production; missing and foreign origins fail", () => {
  assert.equal(sameRequestOrigin("https://example.com", "https://example.com/api", "example.com", false), true);
  for (const origin of [null, "null", "https://foreign.test", "https://example.com.evil.test", "https://example.com/path"])
    assert.equal(sameRequestOrigin(origin, "https://example.com/api", "example.com", false), false);
});
test("loopback alias is permitted only in development with matching host, port and protocol", () => {
  const url = "http://localhost:3101/api";
  assert.equal(sameRequestOrigin("http://127.0.0.1:3101", url, "127.0.0.1:3101", true), true);
  assert.equal(sameRequestOrigin("http://127.0.0.1:3101", url, "127.0.0.1:3101", false), false);
  for (const origin of ["http://foreign.test:3101", "http://127.0.0.1:3102", "https://127.0.0.1:3101", "http://127.0.0.1:3101/path"])
    assert.equal(sameRequestOrigin(origin, url, "127.0.0.1:3101", true), false);
  assert.equal(sameRequestOrigin("http://127.0.0.1:3101", url, "foreign.test:3101", true), false);
});
