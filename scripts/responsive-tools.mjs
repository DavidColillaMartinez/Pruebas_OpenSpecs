/* Stable viewport coordinates and effective contrast, without screenshots.
 * API calls and external openings use the existing identified fixtures/mocks. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium, firefox } from 'playwright';
import { basketLines, installMocks } from './responsive-fixtures.mjs';
import { measure, settle } from './responsive-audit.mjs';

const option=(name,fallback)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3)||fallback;
const base='http://127.0.0.1:4173';
const sizes=option('size','')?[option('size','').split('x').map(Number)]:[[320,568],[390,844],[390,599],[390,600],[390,601],[667,375],[768,1024],[820,1180],[834,1194],[1023,768],[1024,768],[1025,768],[1363,936]];
const results=process.argv.includes('--resume')?JSON.parse(await readFile(option('out','/tmp/opencode/responsive-tools.json'),'utf8')):[];
const tools='.assistant-launcher-ring,.scroll-top-safe:not(.opacity-0),.lrmq-filters-float,button[aria-controls="catalog-selection-drawer"]';

async function snapshot(page) {
  return page.locator(tools).evaluateAll(elements=>elements.filter(e=>e.getClientRects().length>0&&!e.closest('[inert]')&&getComputedStyle(e).visibility!=='hidden').map(e=>{
    const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {id:e.getAttribute('aria-controls')||e.getAttribute('aria-label'),x:r.x,y:r.y,w:r.width,h:r.height,hit:e.contains(hit),inline:[e.style.top,e.style.bottom,e.style.left,e.style.right].join('')};
  }));
}
async function scroll(page,fraction) {
  return page.evaluate(fraction=>{
    const port=innerWidth<1024?document.querySelector('main'):document.scrollingElement;
    port.scrollTo({top:(port.scrollHeight-port.clientHeight)*fraction,behavior:'instant'});
    return {target:port.tagName,top:port.scrollTop,height:port.clientHeight,total:port.scrollHeight};
  },fraction);
}
async function accessible(locator) {
  await locator.evaluate(e=>{e.focus();e.scrollIntoView({block:'center',behavior:'instant'});});
  await locator.page().waitForTimeout(40);
  const evidence=await locator.evaluate(e=>{
    const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2),port=e.closest('main').getBoundingClientRect();
    return {id:e.id||e.getAttribute('aria-label')||e.textContent?.slice(0,70),rect:r.toJSON(),port:port.toJSON(),hit:e.contains(hit)||hit?.contains(e)};
  });
  assert(evidence.hit,JSON.stringify(evidence));
  assert(evidence.rect.y>=0&&evidence.rect.bottom<=evidence.port.bottom+1,JSON.stringify(evidence));
  return evidence;
}
async function contrast(links) {
  return links.evaluateAll(elements=>elements.map(e=>{
    const rgba=value=>{const a=value.match(/[\d.]+/g).map(Number);return [...a.slice(0,3),a[3]??1];};
    const over=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));
    const chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p);
    let bg=[255,255,255];
    // Opaque dark photo-nav backing ends the dependency on image pixels.
    for(const p of chain)bg=over(rgba(getComputedStyle(p).backgroundColor),bg);
    const photo=document.documentElement.getAttribute('data-lrmq-context')==='photo';
    const opaque=chain.some(p=>p!==document.documentElement&&p!==document.body&&!p.matches('main')&&rgba(getComputedStyle(p).backgroundColor)[3]===1);
    let color=rgba(getComputedStyle(e).color),opacity=1;
    for(const p of chain)opacity*=Number(getComputedStyle(p).opacity);
    color[3]*=opacity;const ink=over(color,bg);
    const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const a=luminance(ink),b=luminance(bg);
    return {label:e.textContent,classes:e.className,color:getComputedStyle(e).color,opacity,background:bg,composedInk:ink,ratio:photo&&!opaque?null:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),backgroundModel:photo&&!opaque?'fotografía no muestreada; preservación de colores clara':'alpha compuesto; fondo efectivo independiente de fotografía'};
  }));
}
async function review(browser,name,size,theme) {
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},reducedMotion:'reduce',deviceScaleFactor:1});
  await installMocks(context);context.setDefaultTimeout(8000);
  await context.addInitScript(theme=>{localStorage.setItem('lrmq:theme:v1',theme);window.open=()=>null;},theme);
  const page=await context.newPage();
  const test=async(state,route,fn)=>{
    if(option('only','')&&!state.includes(option('only','')))return;
    try {const evidence=await fn();results.push({browser:name,version:browser.version(),size,theme,route,state,source:'UI local; comercio fixture/mock; no envíos externos',motion:'reduce',status:'PASA',evidence});}
    catch(e){results.push({browser:name,version:browser.version(),size,theme,route,state,status:'FALLA',cause:e.message});}
  };
  const go=async route=>{await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('main h1,main h2').first().waitFor();await settle(page);};
  try {
    for(const populated of [false,true])for(const welcome of [false,true]) {
      await go('/productos');
      await page.evaluate(({populated,welcome,lines})=>{
        localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines:populated?lines:[]}));
        if(welcome)sessionStorage.removeItem('lrmq:assistant:welcome:v1');else sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');
      },{populated,welcome,lines:basketLines});
      for(const route of ['/productos','/productos/gme-mamparas-ducha-akord',...(populated?['/presupuesto']:[]),'/']) {
        await test(`coordenadas: cesta ${populated?'poblada':'vacía'}, bienvenida ${welcome?'nueva':'descartada'}`,route,async()=>{
          await page.evaluate(welcome=>{if(welcome)sessionStorage.removeItem('lrmq:assistant:welcome:v1');else sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');},welcome);
          await go(route);if(welcome)await page.waitForTimeout(1300);
          await page.mouse.move(0,0);
          if(size[0]<1024)assert(await page.evaluate(()=>document.scrollingElement.scrollHeight<=innerHeight+1),'Residual outer document scroll above the reserved tool region');
          const bubble=page.locator('.assistant-welcome');
          const welcomeInitiallyVisible=await bubble.isVisible().catch(()=>false);
          if(await bubble.isVisible())await bubble.hover(); // pause its approved auto-dismiss timer
          const seen=new Map(),samples=[];
          for(const fraction of [0,.15,.3,.5,.75,1,.75,.5,.3,.15,0]) {
            const port=await scroll(page,fraction);await settle(page);
            const coords=await snapshot(page);
            for(const c of coords) {
              assert(c.hit,`Tool covered: ${JSON.stringify(c)}`);assert(c.w>=44&&c.h>=44,JSON.stringify(c));assert.equal(c.inline,'');
              const previous=seen.get(c.id);
              if(previous)for(const axis of ['x','y'])assert(Math.abs(previous[axis]-c[axis])<=1,`Ordinary scroll moved ${c.id}: ${JSON.stringify({previous,c,port})}`);
              else seen.set(c.id,c);
            }
            const selector=route==='/'&&await page.locator('[data-chapter]').count()?'[data-chapter="inicio"]':'main';
            const geometry=await measure(page,selector,selector!=='main');assert.equal(geometry.issues.length,0,JSON.stringify(geometry.issues));
            samples.push({fraction,port,coords});
          }
          if(size[0]<1024&&route==='/productos')assert(seen.has('Abrir filtros del catálogo'),'Floating filters never appeared');
          const fields=[];
          for(const field of await page.locator('main input:not([type="hidden"]):not([tabindex="-1"]),main textarea,main select,main button[type="submit"]').all()) {
            if(await field.evaluate(e=>Boolean(e.closest('[data-chapter]:not([data-chapter="inicio"])'))))continue;
            if(await field.isVisible()&&!await field.isDisabled()) {
              fields.push(await accessible(field));
              for(const c of await snapshot(page))if(seen.has(c.id))for(const axis of ['x','y'])assert(Math.abs(seen.get(c.id)[axis]-c[axis])<=1,`Focus moved ${c.id}`);
            }
          }
          if(await bubble.isVisible()) {
            const before=await snapshot(page);await bubble.getByRole('button',{name:'Cerrar la sugerencia del asistente'}).click();await settle(page);
            for(const c of await snapshot(page)) {
              const previous=before.find(p=>p.id===c.id);if(previous)for(const axis of ['x','y'])assert(Math.abs(previous[axis]-c[axis])<=1,`Welcome dismissal moved ${c.id}`);
            }
          }
          return {samples,fields,tolerance:1,welcomeInitiallyVisible};
        });
      }
    }
    await test('contraste compuesto navegación normal/activo/hover/foco, foto/superficie','/',async()=>{
      const evidence=[];
      for(const id of ['inicio','contacto']) {
        await go('/');const desktop=await page.locator('[data-chapter]').count()>0;
        if(desktop&&id!=='inicio')await page.getByRole('button',{name:'Ir a Contacto',exact:true}).click();
        else if(!desktop)await page.locator(`#${id}`).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
        await settle(page);
        const actions=page.locator('.lrmq-header-photo-action');
        for(const state of ['normal','hover','focus']) {
          await page.mouse.move(0,0);
          if(state==='hover')await actions.last().hover();
          if(state==='focus')await actions.last().focus();
          await settle(page);const data=await contrast(actions);
          if(theme==='dark')for(const d of data)assert(d.ratio>=4.5,JSON.stringify({id,state,...d}));
          evidence.push({id,state:`header ${state}`,data});
        }
        const menu=page.getByRole('button',{name:'Menú',exact:true});if(await menu.count())await menu.click();
        const links=page.locator('.lrmq-header-nav a,.lrmq-mobile-menu a');assert(await links.count()>0);
        await page.mouse.move(0,0);
        for(const state of ['normal','hover','focus']) {
          if(state==='hover')await links.last().hover();
          if(state==='focus') {await page.mouse.move(0,0);await links.last().focus();}
          await settle(page);const data=await contrast(links);
          if(theme==='dark')for(const d of data)assert(d.ratio>=4.5,JSON.stringify({id,state,...d}));
          if(theme==='light'&&state==='normal')for(const d of data) {
            const classes=d.classes.split(/\s+/);
            // /88 is not in the existing Tailwind opacity scale; the approved
            // light Inicio inherits primary21 (no emitted /88 declaration).
            const expected=classes.includes('text-white')?'rgb(255, 255, 255)':classes.includes('text-primary')||d.classes.includes('text-secondary/88')?'rgb(21, 21, 21)':d.classes.includes('text-secondary/45')?'rgba(46, 49, 52, 0.45)':'rgba(46, 49, 52, 0.75)';
            assert.equal(d.color,expected,`Light presentation changed: ${d.label}`);
          }
          evidence.push({id,state,data});
        }
        if(await menu.count())await page.keyboard.press('Escape');
      }
      return evidence;
    });
    await test('catálogo: retorno/restauración scroll y resize ambos sentidos','/productos',async()=>{
      await go('/productos');await scroll(page,.5);await settle(page);
      const card=page.locator('#catalog-items a').first();await card.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
      const before=await page.evaluate(()=>innerWidth<1024?document.querySelector('main').scrollTop:scrollY);
      await card.click();await settle(page);
      const back=page.getByRole('link',{name:/Volver al catálogo/});await back.click();await settle(page);
      const after=await page.evaluate(()=>innerWidth<1024?document.querySelector('main').scrollTop:scrollY);
      assert(Math.abs(before-after)<=1,JSON.stringify({before,after}));
      for(const viewport of [{width:1023,height:768},{width:1024,height:768},{width:1025,height:768},{width:1023,height:768}]) {
        await page.setViewportSize(viewport);await settle(page);
        for(const c of await snapshot(page))assert.equal(c.inline,'');
      }
      await page.setViewportSize({width:size[0],height:size[1]});
      return {before,after,breakpoints:[1023,1024,1025]};
    });
    await test('no escaneo ni coordenadas por scroll en hook','source',async()=>{
      const source=await readFile('src/features/assistant/model/useFloatingSurface.ts','utf8');
      assert(!/createTreeWalker|createRange|placeMobileControls|addEventListener\('scroll'/.test(source));
      assert(!/style\.(top|left|bottom|right)\s*=/.test(source));return {coordinateOwner:'CSS',observer:'dialogs/context, main height and one Inicio slot; no scroll listener or text scan'};
    });
  } finally {await context.close();}
}
for(const [name,type] of Object.entries({chromium,firefox})) {
  if(option('browser','all')!=='all'&&option('browser','all')!==name)continue;
  const browser=await type.launch();try {
    const jobs=sizes.flatMap(size=>['light','dark'].map(theme=>({size,theme}))).filter(job=>{
      const previous=results.filter(r=>r.browser===name&&String(r.size)===String(job.size)&&r.theme===job.theme);
      return previous.length!==17||previous.some(r=>r.status!=='PASA');
    });let next=0;
    await Promise.all(Array.from({length:Number(option('workers','2'))},async()=>{while(next<jobs.length) {
      const {size,theme}=jobs[next++];for(let i=results.length-1;i>=0;i--)if(results[i].browser===name&&String(results[i].size)===String(size)&&results[i].theme===theme)results.splice(i,1);
      await review(browser,name,size,theme);await writeFile(option('out','/tmp/opencode/responsive-tools.json'),JSON.stringify(results,null,2));console.log(`${name} ${size} ${theme}: tool review`);
    }}));
  } finally {await browser.close();}
}
console.log(results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(results.some(r=>r.status!=='PASA'))process.exitCode=1;
