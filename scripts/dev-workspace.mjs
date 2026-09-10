import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// A login-session service survives the temporary terminal used to start it.
// Its plist stays in .local, so this does not install a login startup item.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = join(root, ".local", "preview");
const suffix = createHash("sha256").update(root).digest("hex").slice(0, 10);
const label = `local.ai-receptionist.preview.${suffix}`;
const domain = `gui/${process.getuid?.()}`;
const target = `${domain}/${label}`;
const plistPath = join(directory, "workspace-preview.plist");
const logPath = join(directory, "workspace-development.log");
const url = "http://127.0.0.1:3101";
const action = process.argv[2] ?? "start";

function launchctl(...args) {
  return execFileSync("/bin/launchctl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function service() {
  try { return launchctl("print", target); }
  catch { return null; }
}

function xml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

async function ready() {
  try {
    const response = await fetch(`${url}/__dev/pages`, { signal: AbortSignal.timeout(1500), redirect: "manual" });
    await response.body?.cancel();
    return response.status === 200;
  } catch { return false; }
}

async function checkPort() {
  await new Promise((resolve, reject) => {
    const socket = createServer();
    socket.once("error", () => reject(Error("Port 3101 is already in use. Stop the existing preview before starting the workspace service.")));
    socket.listen(3101, "127.0.0.1", () => socket.close(resolve));
  });
}

async function main() {
  if (process.platform !== "darwin") throw Error("The workspace service uses macOS. Use npm run dev on another platform.");
  if (!["start", "status", "stop"].includes(action)) throw Error("Use start, status or stop.");
  if (process.env.NODE_ENV === "production") throw Error("The workspace preview is for development only.");
  const existing = service();

  if (action === "stop") {
    if (existing) launchctl("bootout", target);
    console.log(existing ? "Workspace preview stopped." : "Workspace preview is already stopped.");
    return;
  }
  if (action === "status") {
    console.log(`Service: ${existing ? "loaded" : "stopped"}`);
    console.log(`Local pages: ${(await ready()) ? url : "not responding"}`);
    console.log(`Log: ${logPath}`);
    return;
  }

  if (!existing) {
    await checkPort();
    mkdirSync(directory, { recursive: true });
    const nodePath = `${dirname(process.execPath)}:/usr/bin:/bin:/usr/sbin:/sbin`;
    writeFileSync(plistPath, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${xml(label)}</string>
  <key>ProgramArguments</key><array><string>${xml(process.execPath)}</string><string>${xml(join(root, "scripts", "dev.mjs"))}</string><string>--port</string><string>3101</string></array>
  <key>WorkingDirectory</key><string>${xml(root)}</string>
  <key>EnvironmentVariables</key><dict><key>NODE_ENV</key><string>development</string><key>PORT</key><string>3101</string><key>DEV_WORKSPACE_MANAGED</key><string>1</string><key>PATH</key><string>${xml(nodePath)}</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>${xml(logPath)}</string>
  <key>StandardErrorPath</key><string>${xml(logPath)}</string>
</dict></plist>
`, { mode: 0o600 });
    launchctl("bootstrap", domain, plistPath);
  }

  const deadline = Date.now() + 25000;
  while (!(await ready())) {
    if (Date.now() > deadline) {
      if (!existing) launchctl("bootout", target);
      throw Error(`The preview did not become ready. Check ${logPath}.`);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  const pid = Number(service()?.match(/\bpid = (\d+)/)?.[1]) || null;
  writeFileSync(join(directory, "development.json"), JSON.stringify({
    manager: "launchd", label, target, pid, node: process.execPath, cwd: root,
    port: 3101, startedAt: new Date().toISOString(), log: logPath, plist: plistPath,
  }, null, 2) + "\n", { mode: 0o600 });
  console.log(`Workspace preview ready: ${url}`);
  console.log(`Features: ${url}/features`);
  console.log(`Page index: ${url}/__dev/pages`);
  console.log("Stop with npm run dev:workspace:stop. This service lasts until stopped or you log out.");
}

main().catch(error => {
  console.error(error.message);
  if (error.stderr) console.error(String(error.stderr).trim());
  process.exitCode = 1;
});
