import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const DIST="/tmp/vb";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"};
const srv=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split("?")[0]);let f=path.join(DIST,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(DIST,"index.html");res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>srv.listen(4181,r));
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1360,height:860},deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:4181/#/read/40",{waitUntil:"networkidle"});
// enable focus mode via the toolbar button
await p.getByTitle(/Focus mode/).click();
await p.waitForTimeout(500);
await p.mouse.move(680,430); // move away from edge
await p.waitForTimeout(400);
await p.screenshot({path:"shots/focus-hidden.png"});
// reveal by moving to far-left edge
await p.mouse.move(2,430);
await p.waitForTimeout(450);
await p.screenshot({path:"shots/focus-revealed.png"});
console.log("done");
await b.close(); srv.close();
