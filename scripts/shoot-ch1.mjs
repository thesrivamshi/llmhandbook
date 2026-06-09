import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = process.env.DIST_DIR || path.join(ROOT, "dist");
const OUT = process.env.SHOT_OUT || ROOT;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(4174, r));
const base = "http://localhost:4174";
const browser = await chromium.launch();

async function shot(route, name, width, height, full = true) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT, name), fullPage: full });
  console.log("wrote", name);
  await ctx.close();
}

await shot("/chapter/1", "ch1-desktop.png", 1320, 1000, true);
await shot("/chapter/1", "ch1-mobile.png", 390, 800, true);
await shot("/page/42", "ch1-page42-fti.png", 1100, 950, true);
await shot("/page/47", "ch1-page47-system.png", 1100, 1000, true);
await shot("/page/34", "ch1-page34-vs.png", 1100, 950, true);

await browser.close();
server.close();
console.log("done");
