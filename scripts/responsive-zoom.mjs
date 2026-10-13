/* Real browser-chrome zoom via X11 keyboard accelerators in owned windows.
 * Not deviceScaleFactor, CSS zoom, pinch scale or viewport substitution. */
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { chromium, firefox } from 'playwright';
import { installMocks, basketLines, detailProducts } from './responsive-fixtures.mjs';
import { sectionIds, chapterLabels } from '../src/data/copy.js';
import { measure, settle } from './responsive-audit.mjs';

const results=[];
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'/tmp/opencode/responsive-zoom.json';
const x=(...args)=>execFileSync('xdotool',args,{encoding:'utf8',timeout:10000}).trim();
for(const [name,type] of Object.entries({chromium,firefox})) {
  const selected=process.argv.find(a=>a.startsWith('--browser='))?.slice(10);
  if(selected&&selected!==name)continue;
  let server,browser,activeTheme;
  try {
    server=await type.launchServer({headless:false,
      ...(name==='chromium'?{args:['--ozone-platform=x11','--window-size=1440,1000']}:{args:['--width=1440','--height=1000'],env:{...process.env,MOZ_ENABLE_WAYLAND:'0'},firefoxUserPrefs:{'toolkit.zoomManager.zoomValues':'0.5,0.75,1,1.25,2,3'}}),
    });
    browser=await type.connect(server.wsEndpoint());
    for(const theme of ['light','dark']) {
      activeTheme=theme;
      const context=await browser.newContext({viewport:null,colorScheme:theme,reducedMotion:'reduce'});
      await installMocks(context);context.setDefaultTimeout(10000);
      await context.addInitScript(({theme,lines})=>{localStorage.setItem('lrmq:theme:v1',theme);localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines}));sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');window.open=()=>null;},{theme,lines:basketLines});
      const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');await settle(page);
      const marker=`AREA-LRMQ-local-zoom-${server.process().pid}-${theme}-${Date.now()}`;
      await page.evaluate(marker=>{document.title=marker;},marker);await page.bringToFront();await page.waitForTimeout(300);
      const id=x('search','--onlyvisible','--name',marker).split('\n').at(-1);
      // Firefox's viewport:null launch can otherwise yield a35px-high initial
      // window. Resize the owned OS window, never emulate a CSS viewport/zoom.
      x('windowsize','--sync',id,'1440','1000');await page.waitForTimeout(400);
      console.log(`${name} ${theme}: owned window ${id}, establishing browser zoom`);
      x('windowactivate','--sync',id);x('key','ctrl+0');await page.waitForTimeout(300);
      const initial=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}));
      for(const zoom of [125,200]) {
        x('windowactivate','--sync',id);x('key','ctrl+0');
        const count=name==='chromium'?(zoom===125?2:5):(zoom===125?1:2);
        x('key',...Array(count).fill(name==='firefox'?'ctrl+plus':'ctrl+equal'));await page.waitForTimeout(600);
        const effective=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}));
        const actual=initial.width/effective.width;
        console.log(`${name} ${theme}: requested ${zoom}%, measured ${actual}, viewport ${effective.width}×${effective.height}`);
        if(Math.abs(actual-zoom/100)>.015) {
          results.push({browser:name,version:browser.version(),theme,size:[initial.width,initial.height],zoom,state:`zoom real ${zoom}%`,viewport:effective,status:'NO PROBADO',cause:`X11 accelerator did not establish requested page zoom; measured ratio ${actual}`});continue;
        }
        const routes=[...sectionIds.map(id=>`/#${id}`),'/productos',...detailProducts.map(p=>`/productos/${p.slug}`),'/presupuesto'];
        for(const route of routes) {
          try {
            await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor({state:'attached'});await settle(page);
            const desktop=await page.locator('[data-chapter]').count()>0;
            let selector='main';
            if(route.startsWith('/#')) {
              const index=sectionIds.indexOf(route.slice(2));
              if(desktop) {if(index>0)await page.getByRole('button',{name:`Ir a ${chapterLabels[index]}`,exact:true}).click();selector=`[data-chapter="${sectionIds[index]}"]`;}
              else {selector=`section#${sectionIds[index]}`;await page.locator(selector).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));}
              await settle(page);
            }
            const data=await measure(page,selector,desktop&&route.startsWith('/#'));
            if(!route.startsWith('/#')) {
              await page.evaluate(()=>{const port=innerWidth<1024?document.querySelector('main'):document.scrollingElement;port.scrollTo({top:port.scrollHeight,behavior:'instant'});});await settle(page);
              data.issues.push(...(await measure(page,'main')).issues);
              for(const field of await page.locator('main input:not([tabindex="-1"]):not([type="hidden"]),main textarea,main select,main button[type="submit"]').all()) {
                if(!await field.isVisible()||await field.isDisabled())continue;
                await field.evaluate(e=>{e.focus();e.scrollIntoView({block:'center',behavior:'instant'});});await settle(page);
                const access=await field.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:e.id,rect:r.toJSON(),hit:e.contains(hit)||hit?.contains(e)};});
                if(!access.hit)data.issues.push({kind:'zoom-field-hit-test',...access});
              }
            }
            results.push({browser:name,version:browser.version(),theme,size:[initial.width,initial.height],zoom,route,state:`zoom real ${zoom}%`,source:'UI/media original; comercio fixtures/mocks',motion:'reduce',mechanism:'owned X11 browser window; Ctrl+0/Ctrl+equal browser accelerators',initial,measuredZoom:actual,status:data.issues.length||data.overflow>1?'FALLA':'PASA',...data});
          } catch(e) {results.push({browser:name,theme,size:[initial.width,initial.height],zoom,route,status:'FALLA',cause:e.message});}
        }
        console.log(`${name} ${theme} real zoom ${zoom}%: ${effective.width}×${effective.height}`);
      }
      await context.close();await writeFile(out,JSON.stringify(results,null,2));
    }
  } catch(e) {
    for(const theme of activeTheme?[activeTheme]:['light','dark'])for(const zoom of [125,200]) {
      if(!results.some(r=>r.browser===name&&r.theme===theme&&r.zoom===zoom))results.push({browser:name,theme,zoom,state:`zoom real ${zoom}%`,status:'NO PROBADO',cause:e.message});
    }
  }
  finally {await browser?.close();await server?.close();}
}
await writeFile(out,JSON.stringify(results,null,2));
console.log(results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(results.some(r=>r.status==='FALLA'))process.exitCode=1;
