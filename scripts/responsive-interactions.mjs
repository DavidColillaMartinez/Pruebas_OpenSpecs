/* Stateful local regression. API and external openings are explicitly mocked.
 * node scripts/responsive-interactions.mjs --out=/tmp/opencode/interactions.json */
import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { products, detailProducts, basketLines, installMocks } from './responsive-fixtures.mjs';
import { measure, settle } from './responsive-audit.mjs';

const option=(name,fallback)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')||fallback;
const base=option('base','http://127.0.0.1:4173');
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local server only');
const results=[];
async function reachable(locator) {
  await locator.evaluate(e=>e.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
  await locator.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const result=await locator.evaluate(e=>{
    const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {ok:r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1&&(e.contains(hit)||hit?.contains(e)),label:e.getAttribute('aria-label')||e.textContent||e.id,rect:r.toJSON(),hit:hit?.getAttribute('aria-label')||hit?.textContent?.slice(0,100)};
  });
  assert(result.ok,`Control is outside viewport or covered: ${JSON.stringify(result)}`);
}

async function run(browser,browserName,size,theme) {
  const state={};
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},reducedMotion:'reduce',colorScheme:theme,deviceScaleFactor:1});
  context.setDefaultTimeout(7000);
  await installMocks(context,state);
  await context.addInitScript(({theme,lines})=>{
    localStorage.setItem('lrmq:theme:v1',theme);
    if(!localStorage.getItem('lrmq:quote-selection:v2'))localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines}));
    window.open=(...args)=>{window.__auditOpened=args;return null;};
  },{theme,lines:basketLines});
  const page=await context.newPage();
  const go=async route=>{await page.goto(base+route,{waitUntil:'domcontentloaded'});if(route.startsWith('/#'))await page.reload({waitUntil:'domcontentloaded'});await page.locator('main').waitFor({state:'attached'});await settle(page);};
  const test=async(name,route,operation)=>{
    if(option('only','') && !name.includes(option('only','')))return;
    try {const evidence=await operation();results.push({browser:browserName,version:browser.version(),theme,size,route,state:name,source:'fixture/mock; no external sends',status:'PASA',evidence,viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}))});}
    catch(e){results.push({browser:browserName,version:browser.version(),theme,size,route,state:name,status:'FALLA',cause:e.message});}
  };
  try {
    await test('menú completo, scroll, foco y cierre','/',async()=>{
      await go('/');
      const menu=page.getByRole('button',{name:'Menú',exact:true});
      if(!await menu.count())return {layout:'navegación amplia',note:'menú cubierto en los tamaños compactos'};
      await menu.click();
      const dialog=page.getByRole('dialog',{name:'Menú de navegación'});
      await dialog.waitFor();await settle(page);
      const destinations=dialog.locator('nav a');assert.equal(await destinations.count(),7);
      for(const link of await destinations.all())await reachable(link);
      for(const text of ['Tienda','Pedir asesoría'])await reachable(dialog.getByRole('link',{name:text,exact:true}));
      await reachable(dialog.getByRole('button',{name:'Cerrar menú'}));
      assert.equal(await page.getByRole('button',{name:'Abrir el asistente de Area LRMQ',exact:true}).count(),0);
      await dialog.getByRole('button',{name:'Cerrar menú'}).focus();await page.keyboard.press('Shift+Tab');
      assert.match(await page.evaluate(()=>document.activeElement.textContent),/Pedir asesoría/);
      await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
      assert.equal(await menu.evaluate(e=>e===document.activeElement),true);
      assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
      return {destinations:7,cta:2,scroll:'reached last CTA and sticky close',focus:'trap/restored',bodyScroll:'restored'};
    });
    await test('filtros poblados y cesta larga; capas y foco','/productos',async()=>{
      await go('/productos?category=espejos');await page.locator('#catalog-items').waitFor();
      const filters=page.getByRole('button',{name:'Filtros',exact:true});
      if(await filters.isVisible().catch(()=>false)) {
        await filters.click();const d=page.getByRole('dialog',{name:'Filtrar'});await settle(page);
        await d.getByRole('button',{name:'Acabado',exact:true}).click();
        await d.getByRole('button',{name:'Ver todas'}).click();
        assert.equal(await d.getByRole('checkbox').count(),14);
        await reachable(d.getByRole('checkbox').last());await reachable(d.getByRole('button',{name:'Cerrar',exact:true}));
        assert.equal(await page.getByRole('button',{name:'Abrir el asistente de Area LRMQ',exact:true}).count(),0);
        await d.getByRole('checkbox').last().click();await page.waitForURL(/finish=/);await settle(page);await page.keyboard.press('Escape');assert(await filters.evaluate(e=>document.activeElement===e));
      } else {
        const aside=page.getByRole('complementary',{name:'Filtros del catálogo'});
        await aside.getByRole('button',{name:'Acabado',exact:true}).click();await aside.getByRole('button',{name:'Ver todas'}).click();
        await reachable(aside.getByRole('checkbox').last());await aside.getByRole('checkbox').last().click();await page.waitForURL(/finish=/);await settle(page);
      }
      const chips=page.locator('[aria-label="Filtros activos"]');await chips.waitFor();
      const longChip=chips.getByRole('button').filter({hasText:'Acabado de revisión'});await longChip.waitFor();await reachable(longChip);
      const chipGeometry=await measure(page,'#catalog-results');assert.equal(chipGeometry.issues.length,0,JSON.stringify(chipGeometry.issues));await longChip.click();
      const basket=page.getByRole('button',{name:/^Mis selecciones,/});
      if(await basket.isVisible().catch(()=>false)) {
        await basket.click();const d=page.getByRole('dialog',{name:'Mis selecciones'});await settle(page);
        assert((await d.getByRole('spinbutton').count())>=6);
        await d.getByRole('spinbutton').first().fill('2');
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lrmq:quote-selection:v2')).lines[0].quantity),2);
        await d.getByRole('button',{name:'Eliminar',exact:true}).last().click();
        assert.equal(await d.getByRole('spinbutton').count(),basketLines.length-1);
        await reachable(d.getByRole('spinbutton').last());await reachable(d.getByRole('link',{name:/Ir a presupuesto/}));
        await reachable(d.getByRole('button',{name:'Cerrar',exact:true}));
        await page.keyboard.press('Escape');assert(await basket.evaluate(e=>document.activeElement===e));
      } else {
        const aside=page.getByRole('complementary',{name:'Resumen de mis selecciones'});await reachable(aside.getByRole('link',{name:/Ir a presupuesto/}));
      }
      await page.evaluate(lines=>localStorage.setItem('lrmq:quote-selection:v2',JSON.stringify({version:2,lines})),basketLines);
      return {longFacets:14,basketLines:basketLines.length,launcher:'yields to dialogs',close:'accessible'};
    });
    await test('búsqueda larga, vacío, error/reintento, paginación','/productos',async()=>{
      state.empty=true;await go('/productos?search=sin-coincidencias');await page.getByRole('heading',{name:'No hay coincidencias'}).waitFor();
      await reachable(page.getByRole('button',{name:'Limpiar filtros',exact:true}).last());
      const empty=await measure(page,'main');assert.equal(empty.issues.length,0,JSON.stringify(empty.issues));
      state.empty=false;state.error=true;await go('/productos');await page.getByRole('alert').waitFor();
      await reachable(page.getByRole('button',{name:'Reintentar',exact:true}));state.error=false;
      await page.getByRole('button',{name:'Reintentar',exact:true}).click();await page.locator('#catalog-items').waitFor();
      state.paginate=true;await go('/productos');const more=page.getByRole('button',{name:/Cargar más/});await more.waitFor();await reachable(more);await more.click();
      await page.getByText('Has llegado al final del catálogo.').waitFor();state.paginate=false;
      let releaseLoading;state.loadingGate=new Promise(resolve=>{releaseLoading=resolve;});
      await go('/productos');try {assert(await page.locator('[aria-busy="true"]').count()>0);} finally {releaseLoading();delete state.loadingGate;}
      await page.locator('#catalog-items').waitFor();
      return {empty:'verified',errorRetry:'verified',pagination:'mock pages, production page size unchanged',loading:'verified'};
    });
    await test('drawers al cruzar sus umbrales restauran scroll','/productos',async()=>{
      await page.setViewportSize({width:390,height:844});await go('/productos');
      await page.getByRole('button',{name:'Filtros',exact:true}).click();await page.setViewportSize({width:1024,height:768});await settle(page);
      assert.equal(await page.getByRole('dialog',{name:'Filtrar'}).count(),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
      await page.getByRole('button',{name:/^Mis selecciones,/}).click();await page.setViewportSize({width:1280,height:800});await settle(page);
      assert.equal(await page.getByRole('dialog',{name:'Mis selecciones'}).count(),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
      await page.setViewportSize({width:size[0],height:size[1]});
      return {filters:'1023→1024',basket:'1279→1280',bodyScroll:'restored'};
    });
    await test('galería ampliada y miniaturas; foco restaurado',`/productos/${products[1].slug}`,async()=>{
      await go(`/productos/${products[1].slug}`);
      const open=page.getByRole('button',{name:/Ampliar imagen/});await open.waitFor();await reachable(open);await open.click();
      const d=page.getByRole('dialog',{name:/Imagen ampliada/});await d.waitFor();await settle(page);
      await reachable(d.getByRole('button',{name:'Cerrar',exact:true}));
      await reachable(d.getByRole('button',{name:'Imagen siguiente'}));await d.getByRole('button',{name:'Imagen siguiente'}).click();
      await d.getByRole('button',{name:'Cerrar',exact:true}).focus();await page.keyboard.press('Shift+Tab');assert.match(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')||''),/Imagen siguiente/);
      await page.keyboard.press('Escape');assert(await open.evaluate(e=>e===document.activeElement));
      const thumbs=page.getByRole('button',{name:/Ver imagen \d/});if(await thumbs.count())await reachable(thumbs.last());
      return {focus:'trapped/restored',arrows:'verified',thumbnailScroll:'last reachable'};
    });
    await test('formularios individuales: edición y envío mock',`/productos/${products[0].slug}`,async()=>{
      await go(`/productos/${products[0].slug}`);
      for(const id of ['quote-name','quote-email','quote-phone','quote-message']) {const field=page.locator(`#${id}`);await reachable(field);await field.focus();}
      await page.locator('#quote-name').fill('Revisión local');await page.locator('#quote-email').fill('review@example.test');
      await page.locator('#quote-message').fill('Prueba local, sin entrega externa.');await page.getByRole('checkbox').check();
      state.quoteDelay=400;state.quoteError=true;
      const send=page.getByRole('button',{name:'Solicitar presupuesto',exact:true});await reachable(send);await send.click();
      await page.getByText(/^Revisión local: comprueba/).waitFor();assert(await page.locator('#quote-name').inputValue()==='Revisión local');
      state.quoteError=false;await send.click();await page.getByText(/Solicitud registrada con el identificador audit-local-confirmation/).waitFor();
      assert.equal(state.quotePayload.items.length,1);assert(!('website' in state.quotePayload));state.quoteDelay=0;
      return {contact:'mock only',payloadItems:1,error:'preserves fields',confirmation:'mock id visible'};
    });
    await test('presupuesto poblado, validación, enviando/error/confirmación','/presupuesto',async()=>{
      await go('/presupuesto');const send=page.getByRole('button',{name:/^Enviar \d/});await reachable(send);await send.click();await page.getByRole('alert').waitFor();
      await page.locator('#joint-name').fill('Revisión local');await page.locator('#joint-email').fill('review@example.test');await page.getByRole('checkbox').check();
      state.quoteDelay=700;state.quoteError=true;await send.click();await page.getByRole('button',{name:'Enviando…'}).waitFor();assert(await page.locator('#joint-name').isDisabled());
      await page.getByRole('alert').first().waitFor();state.quoteError=false;await send.click();await page.getByText(/Solicitud registrada con el identificador audit-local-confirmation/).waitFor();
      assert.equal(state.quotePayload.items.length,basketLines.length);assert.equal(await page.getByRole('spinbutton').count(),0);state.quoteDelay=0;
      return {validation:'verified',sending:'disabled controls',lineErrors:'mock',confirmation:'mock; sent basket removed'};
    });
    await test('presupuesto y cesta vacíos','/presupuesto',async()=>{
      await go('/presupuesto');await page.getByRole('heading',{name:'Aún no hay selecciones'}).waitFor();await reachable(page.getByRole('link',{name:'Explorar catálogo'}));
      await go('/productos');const basket=page.getByRole('button',{name:/Mis selecciones, 0/});if(await basket.isVisible().catch(()=>false)){await basket.click();await page.getByRole('dialog',{name:'Mis selecciones'}).getByText(/Añade una variante/).waitFor();await page.keyboard.press('Escape');}
      return {empty:'verified'};
    });
    await test('variantes, swatches, detalle y añadir por familia','/productos/*',async()=>{
      const evidence=[];
      for(const product of detailProducts) {
        await go(`/productos/${product.slug}`);await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
        if(product.slug==='gme-testio') {
          await page.getByRole('button',{name:'Negro',exact:true}).click();await settle(page);
          assert.match(await page.getByRole('img',{name:/imagen principal/}).getAttribute('src'),/negro.webp$/);
          assert(await page.getByRole('button',{name:'Caño alto',exact:true}).isDisabled(),'Incompatible fixture variant became available');
        }
        if(product.supplier_id==='duplach')await page.getByRole('button',{name:'Maderas naturales',exact:true}).click();
        for(const fieldset of await page.locator('fieldset').all()) {
          if(product.supplier_id==='duplach' && /Familia/.test(await fieldset.locator('legend').textContent()))continue;
          const enabled=fieldset.locator('button:not([disabled])');
          if(await enabled.count()) {await reachable(enabled.last());await enabled.last().click();await settle(page);}
        }
        if(product.supplier_id==='duplach') {
          const swatch=page.getByRole('button',{name:'Olivo',exact:true});await swatch.click();await settle(page);
          assert(await swatch.getAttribute('aria-expanded')==='true');
          const r=await swatch.boundingBox(),parent=await swatch.locator('..').boundingBox();
          assert(r.x>=parent.x-1 && r.x+r.width<=parent.x+parent.width+1,'Enlarged swatch escapes container');
          for(const neighbor of await swatch.locator('..').locator('button').all()) {
            if(await neighbor.getAttribute('aria-expanded')==='true')continue;
            const n=await neighbor.boundingBox();assert(Math.min(r.x+r.width,n.x+n.width)-Math.max(r.x,n.x)<=1||Math.min(r.y+r.height,n.y+n.height)-Math.max(r.y,n.y)<=1,'Enlarged swatch overlaps neighbor');
          }
        }
        const add=page.getByRole('button',{name:'Añadir al presupuesto',exact:true});await reachable(add);assert(!await add.isDisabled(),'Fixture selection incomplete');await add.click();
        await reachable(page.getByRole('link',{name:'Ver presupuesto',exact:true}));
        const details=page.getByRole('button',{name:'Detalles públicos'});if(await details.count()){await reachable(details);await details.click();}
        await settle(page);const geometry=await measure(page,'main');assert.equal(geometry.issues.length,0,JSON.stringify(geometry.issues));
        evidence.push({slug:product.slug,selection:'existing fixture options only',add:'verified'});
      }
      await page.evaluate(()=>localStorage.removeItem('lrmq:quote-selection:v2'));
      return evidence;
    });
    await test('chat largo, compositor, sesión nueva/descartada','/',async()=>{
      await go('/');await page.waitForTimeout(1500);
      const launcher=page.getByRole('button',{name:'Abrir el asistente de Area LRMQ',exact:true});await reachable(launcher);await launcher.click();
      const d=page.getByRole('dialog',{name:'Asistente de Area LRMQ'});await d.waitFor();await settle(page);
      const input=d.locator('textarea');await reachable(input);await input.fill('Borrador local');
      for(const key of ['ArrowUp','ArrowDown','PageUp','PageDown'])await input.press(key);
      await input.fill('Prueba local de respuesta larga');await d.getByRole('button',{name:/Enviar/}).click();
      await d.getByText(/Respuesta mock de revisión local/).waitFor();
      await input.fill('Borrador conservado');await page.keyboard.press('Escape');await launcher.click();assert.equal(await input.inputValue(),'Borrador conservado');
      await reachable(d.getByRole('button',{name:'Cerrar el asistente',exact:true}));await page.keyboard.press('Escape');
      await page.evaluate(()=>sessionStorage.setItem('lrmq:assistant:welcome:v1','dismissed'));await go('/');await page.waitForTimeout(1400);assert.equal(await page.getByLabel('Sugerencia del asistente de Area LRMQ').count(),0);
      return {chatRequests:state.chatRequests,externalRequests:0,draft:'preserved',welcome:'new session and dismissed session exercised'};
    });
    await test('Contacto: teclas, WhatsApp interceptado y marca dark','/#contacto',async()=>{
      await go('/#contacto');
      const desktop=await page.locator('[data-chapter="contacto"]').count()>0;
      const root=desktop?page.locator('[data-chapter="contacto"]'):page.locator('section#contacto');
      const fields=root.locator('input,textarea');
      const active=async()=>page.locator('button[aria-current="step"]').getAttribute('aria-label');
      const before=desktop?await active():null;
      for(const field of await fields.all()) {await reachable(field);await field.focus();for(const key of ['ArrowUp','ArrowDown','PageUp','PageDown'])await field.press(key);if(desktop)assert.equal(await active(),before);}
      await fields.nth(0).fill('Revisión local');await fields.nth(1).fill('600000000');await fields.nth(2).fill('Mensaje local');
      const send=root.getByRole('button',{name:/WhatsApp/});await reachable(send);await send.click();
      const opened=await page.evaluate(()=>window.__auditOpened);assert.match(opened[0],/^https:\/\/wa\.me\/34692912180\?text=/);assert.match(decodeURIComponent(opened[0]),/Revisión local/);
      assert.equal(await root.locator('a[href="tel:+34692912180"]').count(),1);
      assert.equal(await page.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent).telephone),'+34692912180');
      const mark=await root.locator('.lrmq-contact-mark').evaluate(e=>({background:getComputedStyle(e).backgroundColor,image:e.querySelector('img').src}));
      if(theme==='dark')assert.equal(mark.background,'rgb(251, 250, 247)');
      if(desktop) {await fields.nth(0).blur();await page.locator('h2').filter({hasText:'Cuéntanos tu proyecto.'}).click();await page.keyboard.press('ArrowUp');assert.notEqual(await active(),before);}
      return {chapter:'editing keys preserved',whatsapp:'official destination, opening intercepted',mark};
    });
    await test('resize/orientación conserva sección y gate','/',async()=>{
      await page.setViewportSize({width:1363,height:936});await go('/#contacto');
      for(const viewport of [{width:1024,height:719},{width:1024,height:720},{width:1024,height:719},{width:1024,height:940},{width:1024,height:939},{width:1024,height:941},{width:1279,height:880},{width:1280,height:879},{width:1280,height:880},{width:1280,height:881},{width:1279,height:880},{width:1281,height:880},{width:1023,height:768},{width:844,height:390},{width:390,height:844},{width:1363,height:936}]) {
        await page.setViewportSize(viewport);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await settle(page);
        const desktop=await page.locator('[data-chapter="contacto"]').count()>0;
        if(desktop)assert.match(await page.locator('button[aria-current="step"]').getAttribute('aria-label'),/Contacto/,JSON.stringify(viewport));
        else {const r=await page.locator('#contacto').boundingBox();assert(r.y<viewport.height && r.y+r.height>0,`Current chapter lost after resize: ${JSON.stringify({viewport,rect:r})}`);}
      }
      return {bothDirections:true,thresholds:'1024×719/720, new 940; width and orientation',currentSection:'Contacto'};
    });
  } finally {await context.close();}
}
for(const [name,type] of Object.entries({chromium,firefox})) {
  if(option('browser','all')!=='all' && option('browser','all')!==name)continue;
  const browser=await type.launch();
  try {
    const sizes=option('size','')?[option('size','').split('x').map(Number)]:[[320,568],[667,375],[844,390],[1024,720],[1280,720],[1363,936],[1440,900]];
    const jobs=sizes.flatMap(size=>['light','dark'].map(theme=>({size,theme})));let next=0;
    await Promise.all(Array.from({length:2},async()=>{while(next<jobs.length){const job=jobs[next++];await run(browser,name,job.size,job.theme);await writeFile(option('out','/tmp/opencode/responsive-interactions.json'),JSON.stringify(results,null,2));console.log(`${name} ${job.size} ${job.theme}: interactions reviewed`);}}));
  } finally {await browser.close();}
}
await writeFile(option('out','/tmp/opencode/responsive-interactions.json'),JSON.stringify(results,null,2));
console.log(results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(results.some(r=>r.status==='FALLA'))process.exitCode=1;
