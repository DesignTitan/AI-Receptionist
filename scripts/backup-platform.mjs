// Use PostgreSQL's consistent snapshot backup; keys never appear in command arguments.
import { spawn } from "node:child_process";
import { chmod } from "node:fs/promises";
process.umask(0o077);
const destination = process.argv[2];
if (!destination)
  throw Error("Usage: npm run backup -- /secure/path/backup.dump");
const url = new URL(process.env.DATABASE_URL ?? "");
const child = spawn(
  "pg_dump",
  ["--format=custom", "--no-owner", "--no-acl", "--file", destination],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGDATABASE: url.pathname.slice(1),
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGSSLMODE: url.searchParams.get("sslmode") || "require",
    },
  },
);
child.on("exit", async (code) => {
  if (code === 0) {
    await chmod(destination, 0o600);
    console.log(
      "Backup complete. Store this file encrypted and test a restore separately.",
    );
  }
  process.exitCode = code ?? 1;
});
