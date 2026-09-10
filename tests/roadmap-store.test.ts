import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";
import { createRoadmapStore, RoadmapStoreError } from "../src/lib/roadmap/store.ts";
import type { RoadmapSeed } from "../src/lib/roadmap/types.ts";

Object.assign(process.env, { NODE_ENV: "test" });
const run = promisify(execFile);
const seeds: RoadmapSeed[] = [
  { id: "phone-bookings", title: "Phone bookings", description: "Schedule through an incoming call.", status: "pilot" },
  { id: "calendar-sync", title: "Calendar sync", description: "Keep the team's calendar up to date.", status: "planned" },
];
async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const directory = await mkdtemp(join(tmpdir(), "roadmap-store-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sqlitePath = join(directory, "roadmap.sqlite");
  return { sqlitePath, store: createRoadmapStore({ sqlitePath }) };
}
function hasStatus(status: number) {
  return (error: unknown) => error instanceof RoadmapStoreError && error.status === status;
}

test("votes are idempotent intents and private per visitor", async (t) => {
  const { store } = await fixture(t);
  await store.setRoadmapVote(seeds, "alice", "phone-bookings", true);
  await store.setRoadmapVote(seeds, "alice", "phone-bookings", true);
  let result = await store.setRoadmapVote(seeds, "bob", "phone-bookings", true);
  assert.equal(result[0].votes, 2);
  assert.equal(result[0].hasVoted, true);
  assert.deepEqual(Object.keys(result[0]).sort(), ["description", "hasVoted", "id", "source", "status", "title", "votes"].sort());
  assert.equal((await store.getRoadmap(seeds, "charlie"))[0].hasVoted, false);
  await store.setRoadmapVote(seeds, "alice", "phone-bookings", false);
  result = await store.setRoadmapVote(seeds, "alice", "phone-bookings", false);
  assert.equal(result[0].votes, 1);
  assert.equal(result[0].hasVoted, false);
  assert.equal((await store.getRoadmap(seeds, "bob"))[0].hasVoted, true);
  await assert.rejects(store.setRoadmapVote(seeds, "alice", "unlisted", true), hasStatus(404));
});

test("new instances preserve votes while canonical seed edits and removal take effect", async (t) => {
  const { store, sqlitePath } = await fixture(t);
  await store.setRoadmapVote(seeds, "alice", "phone-bookings", true);
  const restarted = createRoadmapStore({ sqlitePath });
  const updated: RoadmapSeed[] = [{ ...seeds[0], title: "Incoming AI bookings", status: "planned" }];
  const result = await restarted.getRoadmap(updated, "alice");
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Incoming AI bookings");
  assert.equal(result[0].status, "planned");
  assert.equal(result[0].votes, 1);
  assert.equal(result[0].hasVoted, true);
  await assert.rejects(restarted.setRoadmapVote([], "alice", "phone-bookings", true), hasStatus(404));
  // A successful catalogue removal hides the item but never destroys its vote history.
  assert.deepEqual(await restarted.getRoadmap([], "alice"), []);
  assert.equal((await createRoadmapStore({ sqlitePath }).getRoadmap(seeds, "alice"))[0].votes, 1);
});

test("pending suggestions are private; review controls public visibility and preserves votes", async (t) => {
  const { store, sqlitePath } = await fixture(t);
  const idea = await store.suggestRoadmapFeature("alice", "  Multi-location   calendars  ", "Coordinate multiple locations.");
  assert.equal(idea.title, "Multi-location calendars");
  assert.equal(idea.status, "pending");
  assert.equal("voter_id" in idea, false);
  assert.equal((await store.getRoadmap(seeds, "alice")).length, seeds.length);
  const featureId = `community-${idea.id}`;
  await assert.rejects(store.setRoadmapVote(seeds, "alice", featureId, true), hasStatus(404));
  await assert.rejects(store.suggestRoadmapFeature("bob", "MULTI-location calendars", "Different description."), hasStatus(409));
  const restarted = createRoadmapStore({ sqlitePath });
  assert.deepEqual(await restarted.listRoadmapSuggestions(), [idea]);
  await restarted.reviewRoadmapSuggestion(idea.id, "approved");
  const approved = (await restarted.setRoadmapVote(seeds, "alice", featureId, true)).find((item) => item.id === featureId)!;
  assert.equal(approved.source, "community");
  assert.equal(approved.status, "exploring");
  assert.equal(approved.votes, 1);
  await restarted.reviewRoadmapSuggestion(idea.id, "declined");
  assert.equal((await restarted.getRoadmap(seeds, "alice")).some((item) => item.id === featureId), false);
  await assert.rejects(restarted.setRoadmapVote(seeds, "alice", featureId, true), hasStatus(404));
  await restarted.reviewRoadmapSuggestion(idea.id, "approved");
  assert.equal((await restarted.getRoadmap(seeds, "alice")).find((item) => item.id === featureId)?.votes, 1);
  await assert.rejects(restarted.reviewRoadmapSuggestion("00000000-0000-4000-8000-000000000000", "approved"), hasStatus(404));
});

test("submission cap persists across instances and includes reviewed suggestions", async (t) => {
  const { store, sqlitePath } = await fixture(t);
  const one = await store.suggestRoadmapFeature("alice", "First feature", "First description.");
  await store.reviewRoadmapSuggestion(one.id, "declined");
  await createRoadmapStore({ sqlitePath }).suggestRoadmapFeature("alice", "Second feature", "Second description.");
  await store.suggestRoadmapFeature("alice", "Third feature", "Third description.");
  await assert.rejects(createRoadmapStore({ sqlitePath }).suggestRoadmapFeature("alice", "Fourth feature", "Fourth description."), hasStatus(429));
  assert.equal((await store.listRoadmapSuggestions()).length, 3);
  assert.equal((await store.suggestRoadmapFeature("bob", "Different feature", "Another visitor's idea.")).status, "pending");
});

const moduleUrl = new URL("../src/lib/roadmap/store.ts", import.meta.url).href;
async function worker(sqlitePath: string, voter: string, action: "vote" | "suggest", title = "") {
  const script = `
    import { createRoadmapStore } from ${JSON.stringify(moduleUrl)};
    process.env.NODE_ENV = 'test';
    const store = createRoadmapStore({ sqlitePath: process.argv[1] });
    try {
      if (process.argv[3] === 'vote') await store.setRoadmapVote(${JSON.stringify(seeds)}, process.argv[2], 'phone-bookings', true);
      else await store.suggestRoadmapFeature(process.argv[2], process.argv[4], 'Submitted from a concurrent process.');
      process.stdout.write('ok');
    } catch (error) { process.stdout.write(String(error.status ?? error.message)); }
  `;
  return (await run(process.execPath, ["--input-type=module", "-e", script, sqlitePath, voter, action, title], { timeout: 20000 })).stdout;
}

test("independent processes cannot lose votes or exceed the persistent suggestion cap", async (t) => {
  const { store, sqlitePath } = await fixture(t);
  await store.getRoadmap(seeds, "viewer");
  const votes = await Promise.all(["alice", "alice", "bob", "charlie", "dana", "erin"].map((voter) => worker(sqlitePath, voter, "vote")));
  assert.deepEqual(votes, ["ok", "ok", "ok", "ok", "ok", "ok"]);
  assert.equal((await createRoadmapStore({ sqlitePath }).getRoadmap(seeds, "viewer"))[0].votes, 5);
  const suggestions = await Promise.all(Array.from({ length: 5 }, (_, i) => worker(sqlitePath, "same-visitor", "suggest", `Concurrent feature ${i}`)));
  assert.equal(suggestions.filter((result) => result === "ok").length, 3);
  assert.equal(suggestions.filter((result) => result === "429").length, 2);
  assert.equal((await store.listRoadmapSuggestions()).length, 3);
  const duplicates = await Promise.all(["one", "two", "three"].map((voter) => worker(sqlitePath, voter, "suggest", "One shared idea")));
  assert.equal(duplicates.filter((result) => result === "ok").length, 1);
  assert.equal(duplicates.filter((result) => result === "409").length, 2);
});

test("production cannot silently use a local SQLite file", async (t) => {
  const { sqlitePath } = await fixture(t);
  Object.assign(process.env, { NODE_ENV: "production" });
  try {
    await assert.rejects(createRoadmapStore({ sqlitePath }).getRoadmap(seeds, "alice"), /only available in development and tests/);
    await assert.rejects(access(sqlitePath));
  } finally { Object.assign(process.env, { NODE_ENV: "test" }); }
});
