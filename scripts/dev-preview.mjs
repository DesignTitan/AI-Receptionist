import { createServer } from "node:http";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getPages } from "../dev/page-catalogue.mjs";

const execFileAsync = promisify(execFile);

const TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"],
  [".webp", "image/webp"], [".avif", "image/avif"], [".gif", "image/gif"],
  [".svg", "image/svg+xml"], [".ico", "image/x-icon"],
]);
const STUDY_NOTES = new Set([
  "/design/docs/hero-comparison-copy.json",
  "/design/luxury-v2/docs/copy.json",
]);
const DEV_FILES = new Map([
  ["/toolbar.js", ["dev", "toolbar.js"]],
  ["/pages", ["dev", "pages.html"]],
  ["/pages/", ["dev", "pages.html"]],
  ["/pages.js", ["dev", "pages.js"]],
  ["/page-catalogue.mjs", ["dev", "page-catalogue.mjs"]],
]);
const PHOTO = "/design/higgsfield-v3/assets/coastal-break-cinema-2-5-clean.png";
const PHOTO_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Human image · AI Receptionist</title>
<style>body{margin:0;background:#101112;color:#f3f3f3;font:15px/1.5 system-ui,sans-serif}main{max-width:1050px;margin:auto;padding:84px 24px 32px}h1{font-size:24px;font-weight:500;letter-spacing:-.03em}figure{margin:24px 0}img{display:block;width:100%;height:auto}figcaption{color:#a9a9aa;margin-top:14px}</style>
</head><body><main><h1>Step away. Bookings keep moving.</h1>
<p>Your customers book online. AI calls them to confirm. You see the outcome.</p>
<figure><img src="/__dev${PHOTO}" width="4016" height="4016" alt="A business owner taking a coffee break on a coastal terrace.">
<figcaption>Higgsfield Cinema Studio Image 2.5 · Human image study</figcaption></figure></main></body></html>`;

function toolbar(tenant, siteGate) {
  tenant = ["medical", "salon", "studio"].includes(tenant) ? tenant : "";
  siteGate = typeof siteGate === "string" && siteGate.trim().toLowerCase() === "locked" ? "locked" : "public";
  return `<ai-dev-toolbar tenant="${tenant}" site-gate="${siteGate}"></ai-dev-toolbar><script type="module" src="/__dev/toolbar.js"></script>`;
}

function injectToolbar(html, markup, path) {
  // The base keeps relative study assets working. Fragment links must still
  // target this page, including when Next removes a directory's trailing slash.
  const current = `/__dev/${path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`;
  html = html.replace(/(href\s*=\s*)(["'])#([^"']*)\2/gi, (_, prefix, quote, hash) => `${prefix}${quote}${current}#${hash}${quote}`);
  const baseParts = path.split("/").filter(Boolean);
  if (!path.endsWith("/")) baseParts.pop();
  const base = `<base href="/__dev/${baseParts.length ? `${baseParts.map(encodeURIComponent).join("/")}/` : ""}">`;
  html = html.replace(/<base\b[^>]*>/gi, "");
  if (/<head(?:\s[^>]*)?>/i.test(html))
    html = html.replace(/<head(?:\s[^>]*)?>/i, (head) => head + base);
  else if (/<html(?:\s[^>]*)?>/i.test(html))
    html = html.replace(/<html(?:\s[^>]*)?>/i, (tag) => tag + `<head>${base}</head>`);
  else html = base + html;
  if (/<ai-dev-toolbar(?:\s|>)/i.test(html)) return html;
  return /<body(?:\s[^>]*)?>/i.test(html)
    ? html.replace(/<body(?:\s[^>]*)?>/i, (body) => body + markup)
    : markup + html;
}

// Reject symlinks at every component, not just at the final file. The root is
// explicitly supplied by the launcher; requests can never select another root.
async function readFileWithin(root, segments, headOnly) {
  let file = root;
  for (let i = 0; i < segments.length; i++) {
    file = join(file, segments[i]);
    const stat = await lstat(file);
    if (stat.isSymbolicLink() || (i < segments.length - 1 && !stat.isDirectory()))
      return null;
  }
  const resolved = await realpath(file);
  const rel = relative(root, resolved);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) return null;
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) return null;
    return { size: stat.size, mtimeMs: stat.mtimeMs, data: headOnly ? null : await handle.readFile() };
  } finally {
    await handle.close();
  }
}

async function pageData(root, options) {
  const pages = getPages(options);
  const sourcePaths = [...new Set(pages.flatMap((entry) => entry.sources))];
  const git = async (...args) => (await execFileAsync("git", ["--literal-pathspecs", "-C", root, ...args], {
    encoding: "utf8", timeout: 5000, maxBuffer: 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  })).stdout;
  let dirty = new Set();
  let hasHistory = false;
  try {
    // A fixture or copied folder must not inherit dates from a parent repository.
    hasHistory = await realpath((await git("rev-parse", "--show-toplevel")).trim()) === root;
    if (hasHistory) {
      const records = (await git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...sourcePaths)).split("\0");
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (!record) continue;
        dirty.add(record.slice(3));
        // In porcelain -z, renames/copies include a second path record.
        if (/[RC]/.test(record.slice(0, 2))) dirty.add(records[++i]);
      }
    }
  } catch {
    hasHistory = false;
    dirty = new Set();
  }
  const datedPages = await Promise.all(pages.map(async (entry) => {
    let updatedAt = null;
    const changedSources = entry.sources.filter((source) => dirty.has(source));
    if (hasHistory) {
      try {
        const committed = (await git("log", "-1", "--format=%cI", "--", ...entry.sources)).trim();
        if (committed && Number.isFinite(Date.parse(committed))) updatedAt = new Date(committed).toISOString();
      } catch { /* No commit date is preferable to an invented one. */ }
    }
    if (changedSources.length) {
      const modified = await Promise.all(changedSources.map(async (source) => {
        try { return (await readFileWithin(root, source.split("/"), true))?.mtimeMs ?? null; }
        catch { return null; }
      }));
      const times = modified.filter((time) => time !== null && Number.isFinite(time));
      if (times.length) updatedAt = new Date(Math.max(...times)).toISOString();
    }
    return { ...entry, updatedAt, workingCopy: changedSources.length > 0 };
  }));
  return Buffer.from(JSON.stringify({ pages: datedPages, generatedAt: new Date().toISOString() }));
}

/** Loopback only, ephemeral port; no Next dependency and no production entrypoint. */
export async function startDevPreview({ repoRoot, tenant = "", siteGate = "public" }) {
  if (process.env.NODE_ENV === "production")
    throw Error("Development previews cannot run in production.");
  const root = await realpath(repoRoot);
  const markup = toolbar(tenant, siteGate);
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    const send = (status, text) => {
      response.statusCode = status;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.setHeader("Content-Length", Buffer.byteLength(text));
      response.end(request.method === "HEAD" ? undefined : text);
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      return send(405, "Method not allowed");
    }
    try {
      // Inspect before URL normalization so encoded and plain traversal are denied.
      let path = decodeURIComponent((request.url ?? "").split(/[?#]/, 1)[0]);
      const parts = path.split("/").filter(Boolean);
      if (!path.startsWith("/") || path.startsWith("//") || /[\\\0]/.test(path)
        || parts.some((p) => p.startsWith(".") || (p.toLowerCase() === "docs" && !STUDY_NOTES.has(path))))
        return send(404, "Not found");
      if (["/design", "/design/luxury-v2", "/design/higgsfield-v3"].includes(path)) {
        // Next normalizes away trailing slashes; a base element preserves relative assets.
        path += "/";
      }
      let content;
      let type;
      if (path === "/pages-data.json") {
        // Re-read source history so a directory reload reflects edits and commits.
        const catalogue = await pageData(root, { tenant, siteGate });
        content = { data: catalogue, size: catalogue.length };
        type = "application/json; charset=utf-8";
      } else if (path === "/design/higgsfield-v3/" || path === "/design/higgsfield-v3/index.html") {
        // Confirm the source exists; never fabricate a successful image preview.
        const photo = await readFileWithin(root, ["design", "hero-comparison", ...PHOTO.split("/").slice(2)], true);
        if (!photo) return send(404, "Not found");
        content = { data: Buffer.from(PHOTO_PAGE), size: Buffer.byteLength(PHOTO_PAGE) };
        type = TYPES.get(".html");
      } else {
        const segments = DEV_FILES.get(path) ?? (path.startsWith("/design/")
            ? ["design", "hero-comparison", ...parts.slice(1), ...(path.endsWith("/") ? ["index.html"] : [])]
            : null);
        if (!segments) return send(404, "Not found");
        type = STUDY_NOTES.has(path)
          ? "application/json; charset=utf-8"
          : path === "/page-catalogue.mjs" ? "text/javascript; charset=utf-8"
            : TYPES.get(extname(segments.at(-1)).toLowerCase());
        if (!type) return send(404, "Not found");
        content = await readFileWithin(root, segments, request.method === "HEAD" && !type.startsWith("text/html"));
        if (!content) return send(404, "Not found");
      }
      if (type.startsWith("text/html")) {
        content.data = Buffer.from(injectToolbar(content.data.toString("utf8"), markup, path));
        content.size = content.data.length;
      }
      response.writeHead(200, { "Content-Type": type, "Content-Length": content.size });
      response.end(request.method === "HEAD" ? undefined : content.data);
    } catch (error) {
      const missing = error instanceof URIError || ["ENOENT", "ENOTDIR", "ELOOP", "EACCES"].includes(error.code);
      send(missing ? 404 : 500, missing ? "Not found" : "Preview unavailable");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  let closing;
  return {
    port: server.address().port,
    close() {
      closing ??= new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
      return closing;
    },
  };
}
