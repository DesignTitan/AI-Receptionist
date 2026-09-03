import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("playwright-core");
const [,, htmlPath, outPath] = process.argv;
const mode = process.argv[4] || "card";
const alpha = process.argv[5] === "png";   // transparent canvas: the panel layer
const W = mode === "stage" ? 1600 : mode === "wide" ? 1200 : 820;
const H = mode === "stage" ? 1000 : mode === "wide" ? 760 : 964;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(350);
if (alpha) {
  // keep only the panel: clip the scene to its rounded rect so the frost is baked and the rest is clear
  await page.evaluate(() => {
    const p = document.querySelector(".panel"), s = document.querySelector(".scene");
    const r = p.getBoundingClientRect(), R = parseFloat(getComputedStyle(p).borderRadius) || 26;
    s.style.clipPath = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${R}px)`;
    document.documentElement.style.background = "transparent"; document.body.style.background = "transparent";
  });
  await page.waitForTimeout(100);
}
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: W, height: H }, omitBackground: alpha, type: alpha ? "png" : "jpeg", quality: alpha ? undefined : 88 });
await browser.close();
if (alpha && outPath.endsWith(".webp")) {
  // playwright only writes png; encode the alpha layer as webp and drop the png
  const { execFileSync } = require("node:child_process"); const fs = require("node:fs");
  const png = outPath.replace(/\.webp$/, ".png"); fs.renameSync(outPath, png);
  execFileSync("cwebp", ["-quiet", "-q", "86", "-alpha_q", "90", "-m", "6", png, "-o", outPath]); fs.unlinkSync(png);
}
console.log("rendered", outPath, W + "x" + H);
