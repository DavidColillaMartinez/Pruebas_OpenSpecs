/* Reusable local geometry review. No screenshots, no real form/chat sends.
 * node scripts/responsive-audit.mjs --quick --out=/tmp/opencode/baseline.json
 * node scripts/responsive-audit.mjs --out=/tmp/opencode/matrix.json
 * Matrix uses reduced motion for deterministic final geometry; --motion runs
 * the original animation timings in critical viewports separately. */
import { chromium, firefox } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { detailProducts, basketLines, installMocks } from './responsive-fixtures.mjs';
import { sectionIds, chapterLabels } from '../src/data/copy.js';

const args = new Set(process.argv.slice(2));
const option = (name, fallback) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') || fallback;
const base = option('base','http://127.0.0.1:4173');
const selectedRoutes=option('routes','').split(',').filter(Boolean);
const includesRoute=route=>!selectedRoutes.length||selectedRoutes.includes(route);
const commercialRoutes=['/productos',...detailProducts.map(p=>`/productos/${p.slug}`),'/presupuesto'];
const expectedRows=sectionIds.filter(id=>includesRoute(`/#${id}`)).length+commercialRoutes.filter(includesRoute).length;
if (!['127.0.0.1','localhost','[::1]'].includes(new URL(base).hostname)) throw new Error('Review must run against a local server');
export const viewports = [
  [1363,936],[320,568],[360,640],[375,667],[390,844],[393,852],[430,932],[667,375],[844,390],
  [768,1024],[1023,768],[1024,719],[1024,720],[1024,768],[1280,720],[1280,800],[1366,768],
  [1440,900],[1536,864],[1920,1080],[2560,1440],[2560,1080],[3440,1440],
  ...[639,640,641,767,768,769,1023,1024,1025,1279,1280,1281].map(w=>[w,768]),
  [1024,721],[1535,864],[1536,864],[1537,864],
  [1024,939],[1024,940],[1024,941],[1280,879],[1280,880],[1280,881],[1279,880],[1281,880],
].filter((v,i,all)=>all.findIndex(other=>String(v)===String(other))===i);
const sizes = option('size','') ? [option('size','').split('x').map(Number)] : args.has('--quick') ? [[1363,936],[320,568],[844,390],[1024,720],[1280,768]] : viewports;
const results = args.has('--resume') ? JSON.parse(await readFile(option('out','/tmp/opencode/responsive-matrix.json'),'utf8')) : [];

export async function settle(page, motion = false) {
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((_,reject)=>setTimeout(()=>reject(new Error('Fonts did not settle')),8000))]));
  if (motion) await page.waitForTimeout(5200);
  else await page.waitForTimeout(160);
  // Wait for finite transitions but not infinite rings/autoplay clocks.
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity && a.playState==='running');
    await Promise.race([Promise.allSettled(finite.map(a=>a.finished)), new Promise(resolve=>setTimeout(resolve,1500))]);
  });
  let previous = '';
  for (let i=0;i<15;i++) {
    const now = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('h1,h2,main input')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})));
    if (now===previous) return;
    previous=now; await page.waitForTimeout(100);
  }
  throw new Error('Geometry did not stabilize');
}

export async function measure(page, selector, desktop = false) {
  return page.evaluate(({selector,desktop}) => {
    const root=document.querySelector(selector);
    if (!root) throw new Error(`Root missing: ${selector}`);
    const issues=[], measurements=[];
    const rect = e => {const r=e.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
    const name=e => e.getAttribute('aria-label') || e.id || (e.textContent||'').trim().slice(0,75) || e.tagName;
    const inScrollport = (e,r) => {
      let box={...r};
      for(let p=e.parentElement;p;p=p.parentElement) {
        const s=getComputedStyle(p),pr=rect(p);
        if(s.overflowX==='auto'||s.overflowX==='scroll') {const right=Math.min(box.x+box.w,pr.x+pr.w);box.x=Math.max(box.x,pr.x);box.w=Math.max(0,right-box.x);}
        if(s.overflowY==='auto'||s.overflowY==='scroll') {const bottom=Math.min(box.y+box.h,pr.y+pr.h);box.y=Math.max(box.y,pr.y);box.h=Math.max(0,bottom-box.y);}
      }
      return box;
    };
    const visible = e => {
      const r=e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[inert],[hidden]')) return false;
      for (let p=e;p;p=p.parentElement) {
        const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.05)return false;
        // Off-screen cards in a deliberately scrollable carousel are not visible.
        if(s.overflowX==='auto'||s.overflowX==='scroll') {const pr=p.getBoundingClientRect();if(r.right<=pr.left||r.left>=pr.right)return false;}
      }
      return true;
    };
    const overlap=(a,b)=>({w:Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),h:Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))});
    const add=(kind,a,b,extra)=>issues.push({kind,a:name(a),b:typeof b==='string'?b:name(b),rect:rect(a),...extra});
    const elements=[...root.querySelectorAll('h1,h2,h3,p,label,input,textarea,select,button,a,blockquote,.animated-logo')].filter(visible);
    const header=document.querySelector('main#contenido > header');
    const blockers=[...document.querySelectorAll('.assistant-launcher-ring,.assistant-welcome,.scroll-top-safe,[aria-controls="catalog-selection-drawer"]')].filter(visible);
    for (const e of elements) {
      if (e.classList.contains('sr-only') || e.closest('.sr-only') || e.getAttribute('aria-hidden')==='true') continue;
      const r=inScrollport(e,rect(e));
      if(r.x < -1 || r.x+r.w > innerWidth+1) add('horizontal',e,'viewport');
      // Text/actions hidden by clipping ancestors, not merely below scrollable document.
      for(let p=e.parentElement;p && p!==document.body;p=p.parentElement) {
        const s=getComputedStyle(p), pr=rect(p);
        if ((s.overflowY==='hidden'||s.overflowY==='clip') && (r.y < pr.y-2||r.y+r.h>pr.y+pr.h+2)) {add('clipped-y',e,p);break;}
        if ((s.overflowX==='hidden'||s.overflowX==='clip') && (r.x < pr.x-2||r.x+r.w>pr.x+pr.w+2)) {add('clipped-x',e,p);break;}
      }
      const onScreen=r.y+r.h>0&&r.y<innerHeight;
      if(desktop && (r.y<0||r.y+r.h>innerHeight+1)) add('chapter-height',e,'viewport');
      if(desktop && header && !header.contains(e) && visible(header) && r.y < rect(header).y+rect(header).h && r.y+r.h>rect(header).y) add('header-space',e,header);
      if(onScreen) for(const b of blockers) {
        if(e===b||e.contains(b)||b.contains(e))continue;
        // Image wrappers intentionally expose a large click surface; check its
        // interaction point and separate arrows rather than treating all media
        // pixels as a second control. Floating basket is an intentional dock;
        // its reachability is tested separately by scrolling focused actions.
        if(e.matches('button,a')&&e.querySelector('img'))continue;
        if(b.matches('[aria-controls="catalog-selection-drawer"]')&&!e.matches('input,textarea,select,button,a'))continue;
        if(e.matches('label')&&e.querySelector('input,textarea,select'))continue;
        let boxes=[r];
        if(e.matches('p,h1,h2,h3,blockquote,label')) {const range=document.createRange();range.selectNodeContents(e);boxes=[...range.getClientRects()].map(t=>({x:t.x,y:t.y,w:t.width,h:t.height}));}
        const o=boxes.map(box=>overlap(inScrollport(e,box),rect(b))).find(o=>o.w>2&&o.h>2); if(o) add('fixed-overlap',e,b,{intersection:o});
      }
      if(onScreen && e.matches('input,textarea,select,button,a') && !e.disabled && r.y>=0 && r.y+r.h<=innerHeight) {
        const x=r.x+r.w/2,y=r.y+r.h/2, hit=document.elementFromPoint(x,y);
        if(hit && !e.contains(hit) && !hit.contains(e) && !hit.closest('[aria-hidden="true"]')) add('hit-test',e,hit);
      }
    }
    const logo=root.querySelector('.animated-logo'), title=root.querySelector('h1');
    if(logo&&title) {
      const tienda=root.querySelector('a[href="/productos"]');
      for(const other of [title,tienda].filter(Boolean)) {const o=overlap(rect(logo),rect(other));if(o.w>1&&o.h>1)add('inicio-identity',logo,other,{intersection:o});}
      measurements.push({element:'logo',...rect(logo)},{element:'h1',...rect(title)},...(tienda?[{element:'Tienda',...rect(tienda)}]:[]));
    }
    const media=[...root.querySelectorAll('img,video')].filter(visible).map(e=>({element:name(e),...rect(e),loaded:e.tagName==='IMG'?e.complete&&e.naturalWidth>0:e.readyState>=1,src:e.currentSrc||e.src}));
    const texts=[...root.querySelectorAll('h1,h2,h3,p')].filter(e=>visible(e)&&!e.closest('figure'));
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++) {
      const a=texts[i],b=texts[j];if(a.contains(b)||b.contains(a))continue;
      const o=overlap(inScrollport(a,rect(a)),inScrollport(b,rect(b)));
      if(o.w>2&&o.h>2)add('text-overlap',a,b,{intersection:o});
    }
    return {issues,measurements,media,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},root:rect(root),overflow:document.documentElement.scrollWidth-innerWidth};
  },{selector,desktop});
}

async function review(browser, browserName, size, theme) {
  const motion=args.has('--motion');
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},deviceScaleFactor:1,colorScheme:theme,reducedMotion:motion?'no-preference':'reduce'});
  context.setDefaultNavigationTimeout(15000);
  context.setDefaultTimeout(8000);
  await installMocks(context);
  await context.addInitScript(({theme,lines})=>{
    localStorage.setItem('lrmq:theme:v1',theme);
    localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines}));
    sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');
    window.open=(...args)=>{window.__auditOpened=args;return null;};
  },{theme,lines:basketLines});
  const page=await context.newPage();
  const record=async (route,state,operation)=>{
    const started=Date.now();
    try {
      const data=await operation();
      results.push({browser:browserName,version:browser.version(),theme,size,route,state,motion:motion?'normal':'reduce',source:route.startsWith('/productos')||route==='/presupuesto'?'fixture/mock':'UI local/media original',status:data.issues.length||data.overflow>1?'FALLA':'PASA',...data});
    } catch(e) { results.push({browser:browserName,version:browser.version(),theme,size,route,state,status:'NO PROBADO',cause:e.message}); }
    if(args.has('--verbose')) console.log(`${browserName} ${size} ${theme} ${route}: ${results.at(-1).status} ${Date.now()-started}ms ${results.at(-1).cause||''}`);
  };
  try {
    for(const [index,id] of sectionIds.entries()) {
      if(!includesRoute(`/#${id}`))continue;
      await record(`/#${id}`,'final',async()=>{
        if(!await page.locator('main#contenido').count()) await page.goto(`${base}/`,{waitUntil:'domcontentloaded'});
        await page.locator('main#contenido').waitFor({state:'attached'});
        const desktop=await page.locator('main#contenido > div.fixed').count()>0;
        if(desktop && index>0) {
          await page.getByRole('button',{name:`Ir a ${chapterLabels[index]}`,exact:true}).click();
        }
        await settle(page,motion);
        let selector;
        if(desktop) {
          selector=`main#contenido > div.fixed > div.absolute > div:nth-child(${index+1})`;
          // Video completion is a distinct original-media interaction; don't
          // manufacture 'ended' to claim real playback during geometry scans.
          if(id==='vision') {const v=page.locator(`${selector} video`);if(await v.count() && await v.evaluate(e=>e.readyState>=1)) {await v.evaluate(e=>{e.currentTime=Math.max(0,e.duration-.1);});await settle(page,motion);}}
        } else {selector=`section#${id}`;await page.locator(selector).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await settle(page);}
        return measure(page,selector,desktop);
      });
    }
    for(const route of commercialRoutes.filter(includesRoute)) {
      await record(route,'poblado',async()=>{
        await page.goto(`${base}${route}`,{waitUntil:'domcontentloaded'});await page.locator('main h1').waitFor();await settle(page);
        const data=await measure(page,'main');
        // Review bottom content as well: fixed controls can obstruct only after scrolling.
        await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await settle(page);
        const bottom=await measure(page,'main');
        return {...data,issues:[...data.issues,...bottom.issues],bottom:bottom.viewport};
      });
    }
  } finally {await context.close();}
  await writeFile(option('out','/tmp/opencode/responsive-matrix.json'),JSON.stringify(results,null,2));
}

export async function runAudit() {
for(const [browserName,type] of Object.entries({chromium,firefox})) {
  if(option('browser','all')!=='all' && option('browser','all')!==browserName) continue;
  let browser;
  try {browser=await type.launch();}
  catch(e) {for(const size of sizes)for(const theme of ['light','dark'])results.push({browser:browserName,size,theme,status:'NO PROBADO',cause:e.message});continue;}
  try {
    const jobs=sizes.flatMap(size=>['light','dark'].map(theme=>({size,theme}))).filter(job=>{
      const existing=results.filter(r=>r.browser===browserName&&String(r.size)===String(job.size)&&r.theme===job.theme);
      return existing.length!==expectedRows||existing.some(r=>r.status!=='PASA');
    });
    let next=0;
    await Promise.all(Array.from({length:Math.min(Number(option('workers','3')),jobs.length)},async()=>{
      while(next<jobs.length){const job=jobs[next++];for(let i=results.length-1;i>=0;i--)if(results[i].browser===browserName&&String(results[i].size)===String(job.size)&&results[i].theme===job.theme)results.splice(i,1);await review(browser,browserName,job.size,job.theme);console.log(`${browserName} ${job.size.join('x')} ${job.theme}: reviewed`);}
    }));
  } finally {await browser.close();}
}
await writeFile(option('out','/tmp/opencode/responsive-matrix.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.reduce((counts,r)=>({...counts,[r.status]:(counts[r.status]||0)+1}),{})));
if(!args.has('--allow-fail') && (!results.length || results.some(r=>r.status!=='PASA')))process.exitCode=1;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) await runAudit();
