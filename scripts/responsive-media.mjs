/* Original-media and original-timing interaction review. No media replacements,
 * synthetic ended events or screenshots. Seek/play is a real player operation. */
import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { measure, settle } from './responsive-audit.mjs';
import { installMocks } from './responsive-fixtures.mjs';
const option=(name,fallback)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')||fallback;
const base=option('base','http://127.0.0.1:4173');
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local server only');
const results=[];
async function review(browser,name,size,theme) {
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},colorScheme:theme,reducedMotion:'no-preference',deviceScaleFactor:1});
  context.setDefaultTimeout(10000);await installMocks(context);
  await context.addInitScript(theme=>{localStorage.setItem('lrmq:theme:v1',theme);sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');window.open=()=>null;},theme);
  const page=await context.newPage();
  const test=async(state,route,fn)=>{
    if(option('only','') && !state.includes(option('only','')))return;
    try {const evidence=await fn();results.push({browser:name,version:browser.version(),size,theme,route,state,status:'PASA',source:'UI y medios originales, API mock',evidence,motion:'normal',viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}))});}
    catch(error){results.push({browser:name,version:browser.version(),size,theme,route,state,status:/media.*(unavailable|timeout)/i.test(error.message)?'NO PROBADO':'FALLA',cause:error.message});}
  };
  const open=async id=>{
    await page.goto(`${base}/#${id}`,{waitUntil:'domcontentloaded'});await page.reload({waitUntil:'domcontentloaded'});await page.locator('main').waitFor({state:'attached'});
    const desktop=await page.locator('[data-chapter]').count()>0;
    const selector=desktop?`[data-chapter="${id}"]`:`section#${id}`;
    if(!desktop)await page.locator(selector).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
    else await page.waitForFunction(selector=>Math.abs(document.querySelector(selector)?.getBoundingClientRect().y||0)<1,selector);
    return {desktop,selector,root:page.locator(selector)};
  };
  const loadVideo=async video=>{
    try {await video.evaluate(async e=>{if(e.readyState>=1)return;await new Promise((resolve,reject)=>{e.addEventListener('loadedmetadata',resolve,{once:true});e.addEventListener('error',()=>reject(new Error('media unavailable')),{once:true});setTimeout(()=>reject(new Error('media timeout')),15000);});});}
    catch(e){throw new Error(`media unavailable/timeout: ${e.message}`);}
    assert(await video.evaluate(e=>e.duration>0&&Number.isFinite(e.duration)),'media unavailable: invalid duration');
  };
  try {
    await test('Inicio inicial/final; callback y tarjetas','/#inicio',async()=>{
      const {desktop,selector,root}=await open('inicio');await page.evaluate(()=>document.fonts.ready);
      const initial=await measure(page,selector,desktop);assert.equal(initial.issues.length,0,JSON.stringify(initial.issues));
      await settle(page,true);const final=await measure(page,selector,desktop);assert.equal(final.issues.length,0,JSON.stringify(final.issues));
      if(desktop)assert.deepEqual(await root.locator('article').evaluateAll(elements=>elements.map(e=>getComputedStyle(e).opacity)),['1','1','1']);
      return {desktop,initial:initial.measurements,final:final.measurements,cascade:desktop?'original timing completed':'native scroll composition'};
    });
    await test('Quiénes somos/Servicios animación final y contenido completo','/',async()=>{
      const evidence=[];
      for(const id of ['quienes-somos','coleccion']) {const {selector,desktop}=await open(id);const initial=await measure(page,selector,desktop);assert.equal(initial.issues.length,0,JSON.stringify(initial.issues));await settle(page,true);const data=await measure(page,selector,desktop);assert.equal(data.issues.length,0,JSON.stringify(data.issues));evidence.push({id,initial:initial.root,media:data.media,root:data.root});}
      return evidence;
    });
    await test('Reformas video original, scrub/progreso o reproducción','/#reformas',async()=>{
      const {root,desktop}=await open('reformas'),video=root.locator('video');await loadVideo(video);
      if(desktop) {for(let i=0;i<3;i++)await page.mouse.wheel(450,650);await settle(page);assert(await video.evaluate(e=>e.currentTime)>0,'Scrub did not advance');}
      else {await video.evaluate(e=>e.play());await page.waitForTimeout(600);assert(await video.evaluate(e=>e.currentTime)>0,'Native playback did not advance');}
      return await video.evaluate(e=>({src:e.currentSrc,duration:e.duration,time:e.currentTime,frame:{width:e.videoWidth,height:e.videoHeight},box:{width:e.clientWidth,height:e.clientHeight}}));
    });
    await test('Visión video, comparación/swipe y replay originales','/#vision',async()=>{
      const {root,selector,desktop}=await open('vision');const video=root.locator('video');await loadVideo(video);
      const initial=await measure(page,selector,desktop);assert.equal(initial.issues.length,0,JSON.stringify(initial.issues));
      if(!desktop) {await root.getByRole('button',{name:'Reproducir boceto'}).click();await page.waitForTimeout(100);}
      await video.evaluate(async e=>{e.currentTime=Math.max(0,e.duration-.2);await e.play();});
      const slider=root.getByRole('slider',{name:'Comparar boceto con imagen final'});await slider.waitFor();await settle(page,true);
      const r=await slider.boundingBox();await page.mouse.move(r.x+r.width*.2,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*.8,r.y+r.height*.5,{steps:6});await page.mouse.up();assert(Number(await slider.getAttribute('aria-valuenow'))>=75);
      await slider.focus();await page.keyboard.press('ArrowLeft');assert(Number(await slider.getAttribute('aria-valuenow'))<80);
      const data=await measure(page,selector,desktop);assert.equal(data.issues.length,0,JSON.stringify(data.issues));
      const colors=await root.locator('h2,p').evaluateAll(elements=>elements.map(e=>({text:e.textContent,color:getComputedStyle(e).color})));
      const src=await video.evaluate(e=>e.currentSrc);await root.getByRole('button',{name:/Reproducir video/}).click();await page.waitForTimeout(500);assert(await video.evaluate(e=>!e.paused&&e.currentTime<2),'Replay did not restart');
      return {src,initial:initial.root,slider:'pointer drag + keyboard',replay:'original player restarted',media:data.media,colors};
    });
    await test('Opiniones carrusel y lectura completa con teclado/rueda','/#opiniones',async()=>{
      const {root,selector,desktop}=await open('opiniones');const initial=await measure(page,selector,desktop);assert.equal(initial.issues.length,0,JSON.stringify(initial.issues));await settle(page,true);
      if(desktop)await root.getByRole('button',{name:'Ver reseña 2',exact:true}).click();
      const quote=desktop?root.locator('figure[aria-hidden="false"] blockquote'):root.locator('blockquote').first();await quote.focus();await quote.hover();
      const before=desktop?await page.locator('button[aria-current="step"]').getAttribute('aria-label'):null;
      await quote.press('PageDown');await page.mouse.wheel(0,120);await settle(page);
      if(desktop)assert.equal(await page.locator('button[aria-current="step"]').getAttribute('aria-label'),before);
      const text=await quote.evaluate(e=>({length:e.textContent.length,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,scrollTop:e.scrollTop}));
      if(desktop)await root.getByRole('button',{name:'Reseña siguiente'}).click();
      else await root.locator('ul').evaluate(e=>{e.scrollLeft=e.clientWidth;});
      return {desktop,text,carousel:'next control or horizontal scroll',narrative:'does not capture review scroll'};
    });
    await test('Contacto inicial/final','/#contacto',async()=>{
      const {selector,desktop}=await open('contacto');const initial=await measure(page,selector,desktop);assert.equal(initial.issues.length,0,JSON.stringify(initial.issues));await settle(page,true);const final=await measure(page,selector,desktop);assert.equal(final.issues.length,0,JSON.stringify(final.issues));return {initial:initial.root,final:final.root};
    });
  } finally {await context.close();}
  await writeFile(option('out','/tmp/opencode/responsive-media.json'),JSON.stringify(results,null,2));
}
for(const [name,type] of Object.entries({chromium,firefox})) {
  if(option('browser','all')!=='all' && option('browser','all')!==name)continue;
  const browser=await type.launch();try {
    const sizes=option('size','')?[option('size','').split('x').map(Number)]:[[320,568],[844,390],[1024,940],[1363,936],[1440,900]];
    const jobs=sizes.flatMap(size=>['light','dark'].map(theme=>({size,theme})));let next=0;
    await Promise.all(Array.from({length:2},async()=>{while(next<jobs.length){const j=jobs[next++];await review(browser,name,j.size,j.theme);console.log(`${name} ${j.size} ${j.theme}: original media reviewed`);}}));
  } finally {await browser.close();}
}
console.log(results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(results.some(r=>r.status==='FALLA'))process.exitCode=1;
