import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const DIST="/tmp/vb";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"};
const srv=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split("?")[0]);let f=path.join(DIST,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(DIST,"index.html");res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>srv.listen(4184,r));
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1360,height:900},deviceScaleFactor:2});
const p=await ctx.newPage();
// reader with concept chips (p42 = FTI architecture, concept-rich)
await p.goto("http://localhost:4184/#/read/42",{waitUntil:"networkidle"});
await p.waitForTimeout(1000);
await p.screenshot({path:"shots/b-concepts.png"});
// quiz
await p.goto("http://localhost:4184/#/quiz",{waitUntil:"networkidle"});
await p.waitForTimeout(800);
await p.getByText("Answer in your head, then reveal →").first().click();
await p.waitForTimeout(400);
await p.screenshot({path:"shots/b-quiz.png"});
// build/tasks
await p.goto("http://localhost:4184/#/build",{waitUntil:"networkidle"});
await p.waitForTimeout(700);
await p.screenshot({path:"shots/b-tasks.png"});
console.log("done");
await b.close(); srv.close();
