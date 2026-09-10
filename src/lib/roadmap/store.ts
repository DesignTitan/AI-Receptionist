import { randomUUID } from "node:crypto";
import { mkdir, chmod } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";
import type { RoadmapItem, RoadmapSeed, Suggestion } from "./types.ts";

/** Only these deliberately public errors may be displayed by the public API. */
export class RoadmapStoreError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "RoadmapStoreError";
    this.status = status;
  }
}

const unavailable = "This roadmap feature is not available.";
const duplicate = "That idea has already been submitted.";
const limit = "You can suggest up to three features in 24 hours. Please try again tomorrow.";
const missing = "That suggestion could not be found.";
const publicErrors = new Map([[unavailable, 404], [duplicate, 409], [limit, 429], [missing, 404]]);
type Row = Record<string, SQLOutputValue>;
type ReviewStatus = "approved" | "declined";
const titleKey = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

function validateVoter(voterId: string) {
  if (typeof voterId !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(voterId)) {
    throw new RoadmapStoreError("Invalid visitor identity.", 400);
  }
}
function validateSeeds(seeds: RoadmapSeed[]) {
  if (!Array.isArray(seeds) || seeds.length > 100 || new Set(seeds.map((s) => s.id)).size !== seeds.length || seeds.some((s) =>
    !/^[a-z0-9][a-z0-9-]{0,119}$/.test(s.id) || s.id.startsWith("community-") ||
    typeof s.title !== "string" || !s.title.trim() || s.title.length > 180 ||
    typeof s.description !== "string" || !s.description.trim() || s.description.length > 2000 ||
    !["planned", "pilot", "exploring"].includes(s.status))) {
    throw new Error("Invalid canonical roadmap catalogue.");
  }
}
function normalizeSuggestion(title: string, description: string) {
  if (typeof title !== "string" || typeof description !== "string") throw new RoadmapStoreError("Enter an idea and a short description.", 400);
  const normalized = { title: title.trim().replace(/\s+/g, " "), description: description.trim() };
  if (!normalized.title || normalized.title.length > 180 || !normalized.description || normalized.description.length > 2000) {
    throw new RoadmapStoreError("Enter an idea of up to 180 characters and a description of up to 2,000 characters.", 400);
  }
  return normalized;
}
function suggestion(row: Row): Suggestion {
  return { id: String(row.id), title: String(row.title), description: String(row.description), createdAt: String(row.created_at), status: row.status as Suggestion["status"] };
}

const schema = `
CREATE TABLE IF NOT EXISTS roadmap_suggestions (
  id TEXT PRIMARY KEY, voter_id TEXT NOT NULL, title TEXT NOT NULL, title_key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','declined')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS roadmap_suggestion_voter_date ON roadmap_suggestions(voter_id, created_at);
CREATE TABLE IF NOT EXISTS roadmap_features (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('planned','pilot','exploring')),
  source TEXT NOT NULL CHECK(source IN ('team','community')), active INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0, suggestion_id TEXT UNIQUE REFERENCES roadmap_suggestions(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS roadmap_votes (
  feature_id TEXT NOT NULL REFERENCES roadmap_features(id), voter_id TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY(feature_id, voter_id)
);`;

function syncSeeds(db: DatabaseSync, seeds: RoadmapSeed[]) {
  db.prepare("UPDATE roadmap_features SET active = 0 WHERE source = 'team'").run();
  const upsert = db.prepare(`INSERT INTO roadmap_features(id,title,description,status,source,active,position,created_at)
    VALUES(?,?,?,?,'team',1,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,
    description=excluded.description,status=excluded.status,active=1,position=excluded.position WHERE roadmap_features.source='team'`);
  seeds.forEach((seed, position) => upsert.run(seed.id, seed.title, seed.description, seed.status, position, new Date().toISOString()));
}
const visible = "f.active = 1 AND (f.source = 'team' OR EXISTS (SELECT 1 FROM roadmap_suggestions s WHERE s.id=f.suggestion_id AND s.status='approved'))";
function items(db: DatabaseSync, voterId: string): RoadmapItem[] {
  return db.prepare(`SELECT f.id,f.title,f.description,f.status,f.source,
    (SELECT count(*) FROM roadmap_votes v WHERE v.feature_id=f.id) AS votes,
    EXISTS(SELECT 1 FROM roadmap_votes v WHERE v.feature_id=f.id AND v.voter_id=?) AS has_voted
    FROM roadmap_features f WHERE ${visible} ORDER BY CASE f.source WHEN 'team' THEN 0 ELSE 1 END,f.position,f.created_at,f.id`).all(voterId).map((row) => ({
      id: String(row.id), title: String(row.title), description: String(row.description), status: row.status as RoadmapItem["status"],
      source: row.source as RoadmapItem["source"], votes: Number(row.votes), hasVoted: Boolean(row.has_voted),
    }));
}

/** Separate file paths make restart and concurrent-process tests independent of the workspace data. */
export function createRoadmapStore(options: { sqlitePath?: string } = {}) {
  function local() {
    const allowed = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    if (options.sqlitePath && !allowed) throw new Error("Local roadmap storage is only available in development and tests.");
    return allowed;
  }
  async function transaction<T>(work: (db: DatabaseSync) => T): Promise<T> {
    if (!local()) throw new Error("Local roadmap storage is only available in development and tests.");
    // Import only at runtime: production routes and builds never initialize native SQLite.
    const { DatabaseSync } = await import("node:sqlite");
    const path = options.sqlitePath ?? resolve(process.cwd(), ".local", "roadmap.sqlite");
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const db = new DatabaseSync(path);
    try {
      await chmod(path, 0o600);
      db.exec("PRAGMA busy_timeout = 10000; PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
      db.exec("BEGIN IMMEDIATE");
      try {
        db.exec(schema);
        const result = work(db);
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    } finally { db.close(); }
  }
  async function rpc<T>(name: string, parameters: Record<string, unknown> = {}): Promise<T> {
    // Kept lazy so development tests do not need Supabase credentials or application imports.
    const { serviceClient } = await import("../supabase");
    const { data, error } = await serviceClient().rpc(name, parameters);
    if (error) {
      const status = publicErrors.get(error.message);
      if (status) throw new RoadmapStoreError(error.message, status);
      throw new Error(`Roadmap storage failed (${error.code ?? "unknown"}).`);
    }
    return data as T;
  }
  return {
    async getRoadmap(seeds: RoadmapSeed[], voterId: string): Promise<RoadmapItem[]> {
      validateSeeds(seeds); validateVoter(voterId);
      if (!local()) return rpc("roadmap_get", { p_seeds: seeds, p_voter: voterId });
      return transaction((db) => { syncSeeds(db, seeds); return items(db, voterId); });
    },
    async setRoadmapVote(seeds: RoadmapSeed[], voterId: string, featureId: string, voted: boolean): Promise<RoadmapItem[]> {
      validateSeeds(seeds); validateVoter(voterId);
      if (typeof featureId !== "string" || featureId.length > 160 || typeof voted !== "boolean") throw new RoadmapStoreError("Invalid vote.", 400);
      if (!local()) return rpc("roadmap_vote", { p_seeds: seeds, p_voter: voterId, p_feature: featureId, p_voted: voted });
      return transaction((db) => {
        syncSeeds(db, seeds);
        if (!db.prepare(`SELECT f.id FROM roadmap_features f WHERE f.id=? AND ${visible}`).get(featureId)) throw new RoadmapStoreError(unavailable, 404);
        if (voted) db.prepare("INSERT INTO roadmap_votes(feature_id,voter_id,created_at) VALUES(?,?,?) ON CONFLICT(feature_id,voter_id) DO NOTHING").run(featureId, voterId, new Date().toISOString());
        else db.prepare("DELETE FROM roadmap_votes WHERE feature_id=? AND voter_id=?").run(featureId, voterId);
        return items(db, voterId);
      });
    },
    async suggestRoadmapFeature(voterId: string, title: string, description: string): Promise<Suggestion> {
      validateVoter(voterId);
      const input = normalizeSuggestion(title, description);
      if (!local()) return rpc("roadmap_suggest", { p_voter: voterId, p_title: input.title, p_description: input.description });
      return transaction((db) => {
        if (db.prepare("SELECT id FROM roadmap_suggestions WHERE title_key=?").get(titleKey(input.title))) throw new RoadmapStoreError(duplicate, 409);
        const count = db.prepare("SELECT count(*) AS count FROM roadmap_suggestions WHERE voter_id=? AND created_at >= ?").get(voterId, new Date(Date.now() - 86_400_000).toISOString());
        if (Number(count?.count) >= 3) throw new RoadmapStoreError(limit, 429);
        const record: Suggestion = { id: randomUUID(), title: input.title, description: input.description, status: "pending", createdAt: new Date().toISOString() };
        db.prepare("INSERT INTO roadmap_suggestions(id,voter_id,title,title_key,description,status,created_at) VALUES(?,?,?,?,?,'pending',?)").run(record.id, voterId, record.title, titleKey(record.title), record.description, record.createdAt);
        return record;
      });
    },
    async listRoadmapSuggestions(): Promise<Suggestion[]> {
      if (!local()) return rpc("roadmap_list_suggestions");
      return transaction((db) => db.prepare("SELECT id,title,description,status,created_at FROM roadmap_suggestions ORDER BY created_at DESC,id").all().map(suggestion));
    },
    async reviewRoadmapSuggestion(id: string, status: ReviewStatus): Promise<void> {
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id) || !["approved", "declined"].includes(status)) throw new RoadmapStoreError("Invalid suggestion review.", 400);
      if (!local()) { await rpc("roadmap_review", { p_id: id, p_status: status }); return; }
      return transaction((db) => {
        const record = db.prepare("SELECT * FROM roadmap_suggestions WHERE id=?").get(id);
        if (!record) throw new RoadmapStoreError(missing, 404);
        db.prepare("UPDATE roadmap_suggestions SET status=? WHERE id=?").run(status, id);
        if (status === "approved") db.prepare(`INSERT INTO roadmap_features(id,title,description,status,source,active,position,suggestion_id,created_at)
          VALUES(?,?,?,'exploring','community',1,0,?,?) ON CONFLICT(id) DO UPDATE SET active=1,title=excluded.title,description=excluded.description`).run(`community-${id}`, record.title, record.description, id, record.created_at);
        else db.prepare("UPDATE roadmap_features SET active=0 WHERE suggestion_id=?").run(id);
      });
    },
  };
}

const store = createRoadmapStore();
export const getRoadmap = store.getRoadmap;
export const setRoadmapVote = store.setRoadmapVote;
export const suggestRoadmapFeature = store.suggestRoadmapFeature;
export const listRoadmapSuggestions = store.listRoadmapSuggestions;
export const reviewRoadmapSuggestion = store.reviewRoadmapSuggestion;
