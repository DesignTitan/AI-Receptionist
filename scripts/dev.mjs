import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startDevPreview } from "./dev-preview.mjs";

async function main() {
  if (process.env.NODE_ENV === "production")
    throw Error("npm run dev cannot start development tools in production. Use npm start.");
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const require = createRequire(resolve(repoRoot, "package.json"));
  process.env.NODE_ENV ??= "development";
  try {
    require("@next/env").loadEnvConfig(repoRoot, true);
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
  }
  if (process.env.NODE_ENV === "production")
    throw Error("Development tools cannot use NODE_ENV=production.");
  let next;
  try {
    next = require.resolve("next/dist/bin/next");
  } catch {
    throw Error("Next.js is not installed. Run npm install first.");
  }
  const preview = await startDevPreview({
    repoRoot,
    tenant: process.env.NEXT_PUBLIC_TENANT ?? "",
    siteGate: process.env.SITE_GATE ?? "public",
  });
  const grouped = process.platform !== "win32";
  const child = spawn(process.execPath, [next, "dev", ...process.argv.slice(2)], {
    cwd: repoRoot,
    stdio: "inherit",
    detached: grouped,
    env: { ...process.env, DEV_PREVIEW_PORT: String(preview.port) },
  });
  let stopSignal;
  let killTimer;
  const kill = (signal) => {
    if (!child.pid) return;
    try {
      if (grouped) process.kill(-child.pid, signal);
      else child.kill(signal);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  const onSignal = (signal) => {
    if (stopSignal) return;
    stopSignal = signal;
    void preview.close().catch(() => {});
    kill(signal);
    killTimer = setTimeout(() => kill("SIGKILL"), 5000);
    killTimer.unref();
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  try {
    const code = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => resolve(code ?? (signal === "SIGINT" ? 130 : 143)));
    });
    process.exitCode = stopSignal ? (stopSignal === "SIGINT" ? 130 : 143) : code;
  } finally {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    clearTimeout(killTimer);
    kill("SIGTERM");
    await preview.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
