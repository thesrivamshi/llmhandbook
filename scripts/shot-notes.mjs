import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const DIST="/tmp/vb";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"};
const srv=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split("?")[0]);let f=path.join(DIST,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(DIST,"index.html");res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>srv.listen(4183,r));
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1360,height:880},deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:4183/#/read/41",{waitUntil:"networkidle"});  // a code-anatomy page (smaller diagram → more notes space)
await p.waitForTimeout(800);
// bookmark this page
await p.getByTitle("Bookmark this page").click();
// switch left to Clean text and highlight a phrase
await p.getByText("Clean text",{exact:true}).first().click();
await p.waitForTimeout(500);
// select some text in the left pane (first paragraph)
await p.evaluate(()=>{
  const para=document.querySelector('section[aria-label^="Book page"] p');
  if(para && para.firstChild){const r=document.createRange(); const node=para.firstChild; const len=Math.min(40,node.textContent.length); r.setStart(node,0); r.setEnd(node,len); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); para.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));}
});
await p.waitForTimeout(400);
await p.screenshot({path:"shots/notes-highlight.png"});
// click the Highlight button if present
const hl=p.getByRole('button',{name:'Highlight'});
if(await hl.count()) { await hl.first().click(); await p.waitForTimeout(300); }
// type a note
await p.locator('textarea').first().fill("KV cache reuses K/V pairs — revisit before Ch 8 inference opt.");
await p.waitForTimeout(300);
await p.screenshot({path:"shots/notes-saved.png"});
console.log("done");
await b.close(); srv.close();
