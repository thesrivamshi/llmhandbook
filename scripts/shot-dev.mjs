import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
for (const [route, name] of [["/#/legend","dev-legend.png"],["/#/read/500","dev-read500.png"]]) {
  const p = await ctx.newPage();
  await p.goto("http://localhost:5173"+route, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "shots/"+name });
  console.log("wrote", name);
  await p.close();
}
await b.close();
