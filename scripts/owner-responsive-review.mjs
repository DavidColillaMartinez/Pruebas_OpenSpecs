/* Focused checks for the owner's seven revisions. API sends remain local mocks.
 * node scripts/owner-responsive-review.mjs --out=/tmp/opencode/owner-review.json */
import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { installMocks, detailProducts, basketLines } from './responsive-fixtures.mjs';
import { measure, settle } from './responsive-audit.mjs';
const option=(key,fallback)=>process.argv.find(a=>a.startsWith(`--${key}=`))?.slice(key.length+3)||fallback;
const base='http://127.0.0.1:4173';
const sizes=option('size','')?[option('size','').split('x').map(Number)]:[[320,568],[390,844],[667,375],[768,1024],[1024,719],[1363,936],[1440,900]];
const results=[];
async function hit(locator) {
  await locator.evaluate(e=>e.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
  await locator.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const data=await locator.evaluate(e=>{
    const r=e.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {ok:e.contains(top)||top?.contains(e),rect:r.toJSON(),hit:top?.getAttribute('aria-label')||top?.textContent?.slice(0,60)};
  });
  assert(data.ok,JSON.stringify(data));return data.rect;
}
async function review(browser,name,size,theme) {
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},deviceScaleFactor:1,reducedMotion:'reduce'});
  await installMocks(context);
  context.setDefaultTimeout(10000);
  await context.addInitScript(({theme,lines})=>{
    localStorage.setItem('lrmq:theme:v1',theme);
    localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines}));
    sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed');
    window.open=()=>null;
  },{theme,lines:basketLines});
  const page=await context.newPage();
  const go=async route=>{await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor({state:'attached'});await settle(page);};
  const test=async(state,route,fn)=>{
    try {const evidence=await fn();results.push({browser:name,version:browser.version(),size,theme,route,state,status:'PASA',source:'UI local; comercio fixture/mock',evidence});}
    catch(e){results.push({browser:name,version:browser.version(),size,theme,route,state,status:'FALLA',cause:e.message});}
  };
  try {
    await test('Inicio centrado, márgenes simétricos y fondo','/',async()=>{
      await go('/');
      const desktop=await page.locator('[data-chapter]').count()>0;
      const root=desktop?page.locator('[data-chapter="inicio"]'):page.locator('section#inicio');
      const heading=await root.locator('h1').boundingBox();assert(Math.abs(heading.x+heading.width/2-size[0]/2)<1);
      const evidence={desktop,heading};
      if(desktop) {
        const logo=await root.locator('.animated-logo').boundingBox(),tienda=await root.getByRole('link',{name:'Abrir catálogo de productos'}).boundingBox();
        assert(Math.abs(logo.x+logo.width/2-size[0]/2)<1);assert(Math.abs(tienda.x+tienda.width/2-size[0]/2)<1);
        assert(logo.y+logo.height<=tienda.y);assert(tienda.y+tienda.height<=heading.y);evidence.logo=logo;evidence.tienda=tienda;
      }
      const background=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
      assert.equal(background,theme==='dark'?'rgb(46, 47, 50)':'rgb(255, 255, 255)');evidence.background=background;
      return evidence;
    });
    await test('Punto activo único después de clic y navegación','/',async()=>{
      await page.setViewportSize({width:1363,height:936});await go('/');
      await page.getByRole('button',{name:'Ir a Servicios',exact:true}).click();await settle(page);
      await page.mouse.move(10,400);await page.mouse.wheel(0,120);await settle(page);
      let active=await page.locator('button[aria-current="step"]').getAttribute('aria-label');assert.equal(active,'Ir a Reformas');
      const filled=await page.locator('button[aria-label^="Ir a "]').evaluateAll(es=>es.filter(e=>e.classList.contains('bg-primary')).map(e=>e.getAttribute('aria-label')));
      assert.deepEqual(filled,[active]);
      await page.getByRole('button',{name:'Ir a Opiniones',exact:true}).click();await settle(page);await page.keyboard.press('ArrowDown');await settle(page);
      active=await page.locator('button[aria-current="step"]').getAttribute('aria-label');assert.equal(active,'Ir a Contacto');
      assert.equal(await page.locator('button[aria-label^="Ir a "]').evaluateAll(es=>es.filter(e=>e.classList.contains('bg-primary')).length),1);
      await page.setViewportSize({width:size[0],height:size[1]});return {afterWheel:'Reformas',afterKeyboard:'Contacto',filled:1};
    });
    await test('Catálogo centrado, fondos y flotantes suaves','/productos',async()=>{
      await go('/productos');await page.locator('#catalog-items').waitFor();await settle(page);
      const main=page.locator('#catalog-content');
      const style=await main.evaluate(e=>({left:getComputedStyle(e).paddingLeft,right:getComputedStyle(e).paddingRight,bg:getComputedStyle(e).backgroundColor}));
      if(size[0]<1024)assert.equal(style.left,style.right);
      assert.equal(style.bg,theme==='dark'?'rgb(28, 29, 31)':'rgb(251, 250, 247)');
      await page.mouse.move(0,0);const launcher=page.getByRole('button',{name:'Abrir el asistente de Area LRMQ',exact:true});
      await launcher.blur();assert.equal(await launcher.evaluate(e=>getComputedStyle(e).opacity),'0.72');
      await launcher.focus();await page.waitForTimeout(230);assert.equal(await launcher.evaluate(e=>getComputedStyle(e).opacity),'1');await launcher.blur();
      return {style,launcherIdle:.72,launcherFocus:1};
    });
    await test('Acceso a filtros tras scroll y restauración de foco','/productos',async()=>{
      await go('/productos');await page.locator('#catalog-items').waitFor();
      if(size[0]>=1024)return {layout:'filtros desktop presentes'};
      const original=page.getByRole('button',{name:'Filtros',exact:true});await original.waitFor();
      assert.equal(await page.getByRole('button',{name:'Abrir filtros del catálogo',exact:true}).count(),0);
      await page.locator('#catalog-items').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await settle(page);
      const floating=page.getByRole('button',{name:'Abrir filtros del catálogo',exact:true});await floating.waitFor();
      // This point is checked where the button actually floats, without relocating it.
      assert(await floating.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
      await floating.click();await page.getByRole('dialog',{name:'Filtrar'}).waitFor();await page.keyboard.press('Escape');
      assert(await floating.evaluate(e=>document.activeElement===e));
      await original.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await settle(page);
      await floating.waitFor({state:'detached'});return {appears:'after original passes top',drawer:'same panel',focus:'restored',returns:'hidden when original returns'};
    });
    await test('Cantidad separada y campos utilizables por familia','/productos/*',async()=>{
      const evidence=[];
      for(const product of detailProducts) {
        await go(`/productos/${product.slug}`);await page.locator('#quote-quantity').waitFor();
        const q=page.locator('#quote-quantity'),label=page.locator('label[for="quote-quantity"]');
        await hit(q);const a=await label.boundingBox(),b=await q.boundingBox();
        assert(b.x-(a.x+a.width)>=15 || b.y-(a.y+a.height)>=7,'Cantidad and input touch');
        await q.fill('2');assert.equal(await q.inputValue(),'2');
        for(const id of ['quote-name','quote-email','quote-phone','quote-message'])await hit(page.locator(`#${id}`));
        const style=await page.locator('#product-content').evaluate(e=>({left:getComputedStyle(e).paddingLeft,right:getComputedStyle(e).paddingRight}));
        if(size[0]<1024)assert.equal(style.left,style.right);evidence.push({slug:product.slug,label:a,input:b,style});
      }
      return evidence;
    });
    await test('Presupuesto centrado y campos accesibles','/presupuesto',async()=>{
      await go('/presupuesto');await page.locator('#joint-name').waitFor();
      for(const id of ['joint-name','joint-email','joint-phone','joint-message'])await hit(page.locator(`#${id}`));
      const style=await page.locator('main').evaluate(e=>({left:getComputedStyle(e).paddingLeft,right:getComputedStyle(e).paddingRight}));
      if(size[0]<1024)assert.equal(style.left,style.right);return style;
    });
    // Keep existing strict geometry diagnostics intact; translucency never
    // exempts a covered input or relabels a collision as accepted by the owner.
    await go('/productos');await page.locator('#catalog-items').waitFor();
    const geometry=await measure(page,'main');
    results.push({browser:name,version:browser.version(),size,theme,route:'/productos',state:'diagnóstico geométrico adicional',status:geometry.issues.length?'FALLA':'PASA',...geometry});
  } finally {await context.close();}
}
for(const [name,type] of Object.entries({chromium,firefox})) {
  if(option('browser','all')!=='all'&&option('browser','all')!==name)continue;
  const browser=await type.launch();try {for(const size of sizes)for(const theme of ['light','dark']) {await review(browser,name,size,theme);await writeFile(option('out','/tmp/opencode/owner-review.json'),JSON.stringify(results,null,2));console.log(`${name} ${size} ${theme}: reviewed`);}}finally{await browser.close();}
}
console.log(results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(results.some(r=>r.status==='FALLA'))process.exitCode=1;
