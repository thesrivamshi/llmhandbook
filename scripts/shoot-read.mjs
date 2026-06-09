// Serve a built dir and screenshot the split-view reader at several pages.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = process.env.DIST_DIR || "/tmp/vb";
const OUT = process.env.SHOT_OUT || path.join(ROOT, "shots");
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".woff": "font/woff",
};
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(4178, r));
const base = "http://localhost:4178";

const shots = (process.env.SHOTS || "read/30:desk,read/30:text,read/200:desk,read/30:mobile").split(",");
const browser = await chromium.launch();
for (const s of shots) {
  const [route, mode] = s.split(":");
  const mobile = mode === "mobile";
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 800 } : { width: 1360, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/#/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  if (mode === "text") {
    await page.getByText("Clean text", { exact: true }).first().click();
    await page.waitForTimeout(600);
  }
  if (mode && mode.startsWith("q-")) {
    await page.locator("input").first().fill(mode.slice(2));
    await page.waitForTimeout(700);
  }
  const name = `${route.replace(/\//g, "-")}-${mode}.png`;
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log("wrote", name);
  await ctx.close();
}
await browser.close();
server.close();
console.log("done");
