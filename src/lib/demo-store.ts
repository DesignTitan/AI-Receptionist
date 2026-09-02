import { VERTICALS } from "@/verticals";
import type { Appointment, CallLog, Client, NotificationLog, Provider } from "./types";

/**
 * In-memory backing store used when Supabase credentials are absent.
 *
 * It keeps the whole product explorable — booking, the call lifecycle and the
 * admin dashboard all work — without asking anyone to provision a database
 * first. State lives on `globalThis` so it survives dev hot reloads, and it is
 * per-instance and ephemeral, which is exactly why it is a demo mode.
 *
 * One store, every vertical: rows carry a `vertical` column rather than
 * living in separate stores, so the demo path stays isomorphic with SQL.
 */
export type DemoStore = {
  providers: Provider[];
  clients: Client[];
  appointments: Appointment[];
  calls: CallLog[];
  notifications: NotificationLog[];
};

function buildSeed(): DemoStore {
  const now = Date.now();
  const store: DemoStore = { providers: [], clients: [], appointments: [], calls: [], notifications: [] };
  for (const vertical of Object.values(VERTICALS)) {
    const seed = vertical.seed.build(now);
    store.providers.push(...vertical.seed.providers.map((p) => ({ ...p })));
    store.clients.push(...seed.clients);
    store.appointments.push(...seed.appointments);
    store.calls.push(...seed.calls);
  }
  return store;
}

const globalRef = globalThis as unknown as { __aiReceptionistStore?: DemoStore };

export function demoStore(): DemoStore {
  if (!globalRef.__aiReceptionistStore) {
    globalRef.__aiReceptionistStore = buildSeed();
  }
  return globalRef.__aiReceptionistStore;
}
