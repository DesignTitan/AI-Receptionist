import test from "node:test";
import assert from "node:assert/strict";
import { formatTime, parseTimeText, timeOptions } from "../src/lib/platform/time-text.ts";

test("reads the ways people actually type times", () => {
  assert.equal(parseTimeText("9"), 9 * 60);
  assert.equal(parseTimeText("9am"), 9 * 60);
  assert.equal(parseTimeText("9:30"), 9 * 60 + 30);
  assert.equal(parseTimeText("9.30 pm"), 21 * 60 + 30);
  assert.equal(parseTimeText("17:00"), 17 * 60);
  assert.equal(parseTimeText("5", true), 17 * 60, "a closing time leans PM");
  assert.equal(parseTimeText("5", false), 5 * 60);
  assert.equal(parseTimeText("12 pm"), 12 * 60);
  assert.equal(parseTimeText("12 am"), 0);
  assert.equal(parseTimeText("24:00"), 1440);
});

test("rejects things that aren't times", () => {
  for (const bad of ["", "abc", "13 pm", "9:75", "25:00", "24:30"]) assert.equal(parseTimeText(bad), null, bad);
});

test("formats for display and lists 15-minute options within bounds", () => {
  assert.equal(formatTime(9 * 60), "9:00 AM");
  assert.equal(formatTime(18 * 60 + 30), "6:30 PM");
  assert.equal(formatTime(0), "12:00 AM");
  assert.equal(formatTime(1440), "Midnight");
  const opts = timeOptions(9 * 60 + 5, 10 * 60);
  assert.deepEqual(opts, [555, 570, 585, 600]);
});
