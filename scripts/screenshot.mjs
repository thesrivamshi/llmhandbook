// Serve the built app and screenshot /legend (desktop + mobile) for the checkpoint.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = process.env.DIST_DIR || path.join(ROOT, "dist");
const OUT = process.env.SHOT_OUT || ROOT;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".woff": "font/woff",
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, "index.html"); // SPA fallback
  }
  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise((r) => server.listen(4173, r));
const base = "http://localhost:4173";

const browser = await chromium.launch();

async function shot(name, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${base}/legend`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // let fonts settle
  const out = path.join(OUT, name);
  await page.screenshot({ path: out, fullPage: true });
  console.log("wrote", out);
  await ctx.close();
}

await shot("legend-desktop.png", 1280, 900);
await shot("legend-mobile.png", 390, 800);

await browser.close();
server.close();
console.log("done");
