import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { request } from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startDevPreview } from "../scripts/dev-preview.mjs";
import { getPages } from "../dev/page-catalogue.mjs";

function getAt(port: number, path: string, method = "GET") {
  return new Promise<{ status: number; headers: import("node:http").IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path, method }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("development preview exposes only allowed files and injects the navigation", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "receptionist-preview-"));
  let preview: Awaited<ReturnType<typeof startDevPreview>> | undefined;
  t.after(async () => { await preview?.close(); await rm(root, { recursive: true, force: true }); });
  const gallery = join(root, "design", "hero-comparison");
  for (const directory of ["dev", "design/hero-comparison/assets", "design/hero-comparison/docs",
    "design/hero-comparison/luxury-v2/docs", "design/hero-comparison/higgsfield-v3/assets", "design/hero-comparison/campaign-v4", "private"])
    await mkdir(join(root, directory), { recursive: true });
  const html = '<!doctype html><html><body class="gallery"><h1>Design fixture</h1></body></html>';
  const photo = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  await Promise.all([
    writeFile(join(root, "dev/toolbar.js"), 'customElements.define("fixture-toolbar", class extends HTMLElement {});'),
    writeFile(join(root, "dev/pages.html"), html),
    writeFile(join(root, "dev/pages.js"), 'document.title = "Page index";'),
    writeFile(join(root, "dev/journey.html"), html.replace("Design fixture", "User journey fixture")),
    writeFile(join(root, "dev/journey.js"), 'document.title = "User journey";'),
    writeFile(join(root, "dev/page-catalogue.mjs"), 'export const fixture = true;'),
    writeFile(join(root, "dev/private.json"), '{"secret":"fixture"}'),
    writeFile(join(gallery, "index.html"), html),
    writeFile(join(gallery, "luxury-v2/index.html"), html),
    writeFile(join(gallery, "campaign-v4/index.html"), html),
    writeFile(join(gallery, "assets/photo.png"), photo),
    writeFile(join(gallery, "assets/site.css"), "body{color:white}"),
    writeFile(join(gallery, "higgsfield-v3/assets/coastal-break-cinema-2-5-clean.png"), photo),
    writeFile(join(gallery, "docs/secret.html"), "private documentation"),
    writeFile(join(gallery, "docs/hero-comparison-copy.json"), '{"study":"original"}'),
    writeFile(join(gallery, "luxury-v2/docs/copy.json"), '{"study":"luxury"}'),
    writeFile(join(gallery, "docs/private.json"), '{"private":true}'),
    writeFile(join(gallery, "assets/manifest.json"), '{"secret":"fixture"}'),
    writeFile(join(root, "private/leak.html"), "private fixture"),
    writeFile(join(root, ".env.local"), "SECRET=fixture"),
  ]);
  await symlink(join(root, "private/leak.html"), join(gallery, "assets/linked.html"));
  await symlink(join(root, "private"), join(gallery, "linked-directory"));
  preview = await startDevPreview({ repoRoot: root, tenant: "salon", siteGate: "locked" });
  function get(path: string, method = "GET") {
    return getAt(preview!.port, path, method);
  }
  for (const path of ["/design/", "/design", "/design/luxury-v2/", "/design/luxury-v2", "/design/higgsfield-v3/", "/design/higgsfield-v3", "/design/campaign-v4/", "/design/campaign-v4"]) {
    const page = await get(path);
    assert.equal(page.status, 200, path);
    assert.equal(page.headers["cache-control"], "no-store");
    assert.match(page.body.toString(), /<body[^>]*><ai-dev-toolbar tenant="salon" site-gate="locked">/);
    assert.match(page.body.toString(), /<script type="module" src="\/__dev\/toolbar.js">/);
    assert.ok(page.body.toString().includes(`<base href="/__dev${path.replace(/\/$/, "")}/">`));
    const head = await get(path, "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(Number(head.headers["content-length"]), page.body.length);
  }
  assert.equal((await get("/toolbar.js")).status, 200);
  for (const path of ["/pages", "/pages/", "/journey", "/journey/"]) {
    const page = await get(path);
    assert.equal(page.status, 200);
    assert.match(page.body.toString(), /<body[^>]*><ai-dev-toolbar tenant="salon" site-gate="locked">/);
    assert.match(page.body.toString(), /<script type="module" src="\/__dev\/toolbar.js">/);
    if (path.startsWith("/journey")) assert.match(page.body.toString(), /User journey fixture/);
    const head = await get(path, "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(Number(head.headers["content-length"]), page.body.length);
  }
  for (const path of ["/pages.js", "/journey.js", "/page-catalogue.mjs"]) {
    const script = await get(path);
    assert.equal(script.status, 200);
    assert.equal(script.headers["content-type"], "text/javascript; charset=utf-8");
    assert.equal(script.headers["cache-control"], "no-store");
    if (path === "/journey.js") assert.equal(script.body.toString(), 'document.title = "User journey";');
  }
  const data = await get("/pages-data.json");
  assert.equal(data.status, 200);
  assert.equal(data.headers["content-type"], "application/json; charset=utf-8");
  assert.equal(data.headers["cache-control"], "no-store");
  const snapshot = JSON.parse(data.body.toString());
  assert.equal(snapshot.pages.length, 12);
  assert.ok(snapshot.pages.every((entry: { updatedAt: string | null; workingCopy: boolean }) => entry.updatedAt === null && !entry.workingCopy));
  assert.ok(Number.isFinite(Date.parse(snapshot.generatedAt)));
  assert.equal(snapshot.pages.find((entry: { id: string }) => entry.id === "salon-home").href, "/");
  const dataHead = await get("/pages-data.json", "HEAD");
  assert.equal(dataHead.status, 200);
  assert.equal(dataHead.body.length, 0);
  assert.equal(Number(dataHead.headers["content-length"]), data.body.length);
  assert.equal((await get("/design/assets/site.css")).status, 200);
  assert.deepEqual((await get("/design/assets/photo.png")).body, photo);
  for (const [path, study] of [["/design/docs/hero-comparison-copy.json", "original"], ["/design/luxury-v2/docs/copy.json", "luxury"]]) {
    const notes = await get(path);
    assert.equal(notes.status, 200);
    assert.equal(notes.headers["content-type"], "application/json; charset=utf-8");
    assert.equal(notes.headers["cache-control"], "no-store");
    assert.deepEqual(JSON.parse(notes.body.toString()), { study });
    const head = await get(path, "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(Number(head.headers["content-length"]), notes.body.length);
  }
  const post = await get("/toolbar.js", "POST");
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, "GET, HEAD");
  assert.equal((await get("/pages-data.json", "POST")).status, 405);
  for (const path of ["/", "/.env.local", "/pages.html", "/journey.html", "/private.json", "/dev/private.json", "/pages-data.json/",
    "/journey.js/../private.json",
    "/page-catalogue.mjs/../private.json", "/design/docs/secret.html", "/design/docs/private.json", "/design/docs/copy.json", "/design/assets/manifest.json",
    "/design/assets/", "/design/assets/linked.html", "/design/linked-directory/leak.html",
    "/design/../../private/leak.html", "/design/%2e%2e/%2e%2e/private/leak.html",
    "/design/%2e%2e%2f%2e%2e%2fprivate/leak.html", "/design/%5c..%5cprivate/leak.html",
    "/design/%00.png", "/design/%zz.png", "/design/.hidden.html"])
    assert.equal((await get(path)).status, 404, path);
  await preview.close();
  preview = await startDevPreview({ repoRoot: root, tenant: '\" onload=\"alert(1)', siteGate: "  LOCKED  " });
  assert.match((await get("/design/")).body.toString(), /<ai-dev-toolbar tenant="" site-gate="locked">/);
  await preview.close();
  preview = await startDevPreview({ repoRoot: root, tenant: "unrecognized", siteGate: "unexpected" });
  assert.match((await get("/design/")).body.toString(), /<ai-dev-toolbar tenant="" site-gate="public">/);
});

test("page catalogue contains canonical routes for ordinary and tenant previews", () => {
  const pages = getPages();
  assert.equal(pages.length, 20);
  assert.equal(new Set(pages.map((entry) => entry.id)).size, pages.length);
  assert.equal(new Set(pages.map((entry) => entry.href)).size, pages.length);
  assert.deepEqual([...new Set(pages.map((entry) => entry.group))], [
    "Marketing", "Customer", "Business demos", "Booking pages", "Staff", "Design studies", "Internal tools",
  ]);
  assert.equal(pages.find((entry) => entry.id === "page-index")?.kind, "internal");
  const journey = pages.find((entry) => entry.id === "user-journey");
  assert.equal(journey?.label, "User journey");
  assert.equal(journey?.href, "/__dev/journey");
  assert.equal(journey?.group, "Internal tools");
  assert.equal(journey?.kind, "internal");
  assert.equal(journey?.access, "development");
  assert.deepEqual(journey?.sources, ["dev/journey.html", "dev/journey.js"]);
  const marketingV2 = pages.find((entry) => entry.id === "study-luxury");
  assert.equal(marketingV2?.label, "Marketing site · V2");
  assert.equal(marketingV2?.group, "Marketing");
  assert.equal(marketingV2?.kind, "study");
  assert.equal(marketingV2?.access, "development");
  assert.equal(marketingV2?.href, "/__dev/design/luxury-v2/");
  assert.equal(pages.filter((entry) => entry.kind === "study").length, 4);
  assert.deepEqual(getPages({ tenant: "unknown" }), pages);
  assert.equal(getPages({ siteGate: "  LOCKED " }).length, 21);
  for (const tenant of ["medical", "salon", "studio"]) {
    const preview = getPages({ tenant });
    assert.equal(preview.length, 11);
    assert.equal(preview.find((entry) => entry.id === `${tenant}-home`)?.href, "/");
    assert.match(preview.find((entry) => entry.id === `${tenant}-booking`)!.href, /^\/book\/[^/]+$/);
    assert.deepEqual(preview.find((entry) => entry.id === "study-luxury"), marketingV2);
    assert.ok(!preview.some((entry) => entry.kind === "app" && ["Marketing", "Customer"].includes(entry.group)));
    assert.ok(!preview.some((entry) => ["marketing", "demos", "start", "account", "owner-login"].includes(entry.id)));
    assert.ok(!preview.some((entry) => entry.href.startsWith("/demo/")));
  }
  assert.ok(pages.every((entry) => entry.sources.length > 0 && entry.sources.every((source: string) =>
    !source.startsWith("/") && !source.split("/").includes("..") && !source.includes(".env"))));
});

test("page dates reflect literal source history and refresh after edits and commits", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "receptionist-page-history-"));
  let preview: Awaited<ReturnType<typeof startDevPreview>> | undefined;
  t.after(async () => { await preview?.close(); await rm(root, { recursive: true, force: true }); });
  const files = ["src/app/(marketing)/page.tsx", "src/app/demo/[vertical]/page.tsx", "dev/pages.html", "dev/pages.js"];
  for (const file of files) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), "committed fixture");
  }
  function git(args: string[], date = "2026-01-02T12:00:00Z") {
    const result = spawnSync("git", ["-C", root, ...args], {
      env: { ...process.env, GIT_AUTHOR_NAME: "Preview fixture", GIT_AUTHOR_EMAIL: "fixture@example.test",
        GIT_COMMITTER_NAME: "Preview fixture", GIT_COMMITTER_EMAIL: "fixture@example.test",
        GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
  }
  git(["init", "--quiet"]);
  git(["add", "."]);
  git(["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Source fixture"]);
  // This path would incorrectly match [vertical] without literal pathspecs.
  await mkdir(join(root, "src/app/demo/v"), { recursive: true });
  await writeFile(join(root, "src/app/demo/v/page.tsx"), "unrelated later commit");
  git(["add", "."]);
  git(["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Unrelated fixture"], "2026-01-03T12:00:00Z");
  await writeFile(join(root, files[0]), "edited fixture");
  await utimes(join(root, files[0]), new Date("2026-02-06T12:00:00Z"), new Date("2026-02-06T12:00:00Z"));
  await mkdir(join(root, "src/app/account"), { recursive: true });
  await writeFile(join(root, "src/app/account/page.tsx"), "untracked fixture");
  await utimes(join(root, "src/app/account/page.tsx"), new Date("2026-02-08T12:00:00Z"), new Date("2026-02-08T12:00:00Z"));
  await rm(join(root, "dev/pages.js"));
  preview = await startDevPreview({ repoRoot: root });
  const response = await getAt(preview.port, "/pages-data.json");
  assert.equal(response.status, 200);
  const data = JSON.parse(response.body.toString());
  const byId = new Map<string, { updatedAt: string | null; workingCopy: boolean }>(data.pages.map((entry: { id: string }) => [entry.id, entry]));
  assert.equal(byId.get("marketing")?.updatedAt, "2026-02-06T12:00:00.000Z");
  assert.equal(byId.get("marketing")?.workingCopy, true);
  assert.equal(byId.get("account")?.updatedAt, "2026-02-08T12:00:00.000Z");
  assert.equal(byId.get("account")?.workingCopy, true);
  assert.equal(byId.get("medical-home")?.updatedAt, "2026-01-02T12:00:00.000Z");
  assert.equal(byId.get("medical-home")?.workingCopy, false);
  assert.equal(byId.get("page-index")?.workingCopy, true);
  assert.equal(byId.get("page-index")?.updatedAt, "2026-01-02T12:00:00.000Z");
  assert.equal(byId.get("staff-customers")?.updatedAt, null);
  assert.equal(byId.get("staff-customers")?.workingCopy, false);
  await writeFile(join(root, files[0]), "another edit while the server is running");
  await utimes(join(root, files[0]), new Date("2026-03-01T12:00:00Z"), new Date("2026-03-01T12:00:00Z"));
  const afterEdit = JSON.parse((await getAt(preview.port, "/pages-data.json")).body.toString());
  const edited = afterEdit.pages.find((entry: { id: string }) => entry.id === "marketing");
  assert.equal(edited.updatedAt, "2026-03-01T12:00:00.000Z");
  assert.equal(edited.workingCopy, true);
  git(["add", "."]);
  git(["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Commit running-preview changes"], "2026-03-02T12:00:00Z");
  const afterCommit = JSON.parse((await getAt(preview.port, "/pages-data.json")).body.toString());
  for (const id of ["marketing", "account", "page-index"]) {
    const committed = afterCommit.pages.find((entry: { id: string }) => entry.id === id);
    assert.equal(committed.updatedAt, "2026-03-02T12:00:00.000Z");
    assert.equal(committed.workingCopy, false);
  }
  assert.equal(afterCommit.pages.find((entry: { id: string }) => entry.id === "medical-home").updatedAt, "2026-01-02T12:00:00.000Z");
});

test("development launcher refuses production before loading Next or starting servers", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/dev.mjs", import.meta.url))], {
    env: { ...process.env, NODE_ENV: "production" }, encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot start development tools in production/);
  const direct = spawnSync(process.execPath, ["--input-type=module", "-e",
    'const { startDevPreview } = await import(process.argv[1]); await startDevPreview({ repoRoot: "/does-not-exist" });',
    new URL("../scripts/dev-preview.mjs", import.meta.url).href], {
    env: { ...process.env, NODE_ENV: "production" }, encoding: "utf8",
  });
  assert.equal(direct.status, 1);
  assert.match(direct.stderr, /Development previews cannot run in production/);
  assert.doesNotMatch(direct.stderr, /ENOENT/);
});
