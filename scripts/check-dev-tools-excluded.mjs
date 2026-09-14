import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../.next/", import.meta.url));
const markers = ["ai-dev-toolbar", "/__dev/toolbar.js", "Development navigation", "Higgsfield photograph · V3", "AI Receptionist page directory", "/__dev/pages-data.json", "/__dev/page-catalogue.mjs"];

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(file);
    else if (/\.(?:js|json|html|css|rsc|map)$/.test(entry.name)) {
      let content = await readFile(file, "utf8");
      // A source map embeds the original source text, including dev-only code that the
      // build already stripped behind NODE_ENV guards. Check what the map points at, not
      // that text: shipped code is caught by scanning the .js next to it.
      if (entry.name.endsWith(".map")) {
        try { const map = JSON.parse(content); delete map.sourcesContent; content = JSON.stringify(map); } catch {}
      }
      if (markers.some((marker) => content.includes(marker))) {
        throw new Error(`Development toolbar leaked into production: ${path.relative(root, file)}`);
      }
    }
  }
}

await checkDirectory(path.join(root, "static"));
await checkDirectory(path.join(root, "server"));
const manifest = JSON.parse(await readFile(path.join(root, "routes-manifest.json"), "utf8"));
if (JSON.stringify(manifest.rewrites).includes("/__dev")) {
  throw new Error("Development preview rewrite leaked into production.");
}
console.log("Production check passed: no development toolbar assets or preview routes.");
