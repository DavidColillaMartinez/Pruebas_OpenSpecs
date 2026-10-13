import { readFile, writeFile } from 'node:fs/promises';
const input=process.argv[2];
if(!input) throw new Error('Supply audit JSON path');
const all=(await Promise.all(input.split(',').map(async path=>JSON.parse(await readFile(path,'utf8'))))).flat();
const results=[...new Map(all.map(r=>[[r.browser,String(r.size),r.theme,r.route,r.state,r.motion||'',r.zoom||''].join('|'),r])).values()];
if(!results.length)throw new Error('No audit evidence supplied');
const seen=new Set();
for(const r of results) {
  for(const issue of r.issues||[]) {
    const key=[r.route,issue.kind,issue.a,issue.b].join('|');
    if(seen.has(key))continue;seen.add(key);
    console.log(JSON.stringify({browser:r.browser,theme:r.theme,size:r.size,route:r.route,...issue}));
  }
  if(r.cause)console.log(`${r.browser} ${r.size} ${r.route}: ${r.cause}`);
}
console.log('Totals:',results.reduce((c,r)=>({...c,[r.status]:(c[r.status]||0)+1}),{}));
if(process.argv[3]) {
  const normal=results.every(r=>r.motion==='normal');
  const zoomed=results.some(r=>r.zoom);
  const date=process.argv[4]||'2026-10-09';
  const lines=[zoomed?`# Zoom real local — ${date}`:normal?`# Media y fases de animación locales — ${date}`:`# Matriz responsive local — ${date}`,'',
    zoomed ? 'Zoom real por aceleradores del navegador en ventanas X11 propias. Viewport inicial/efectivo medidos; DPR resultante cambia con zoom real (no deviceScaleFactor, CSS zoom ni viewport emulado). Geometría/centros de campos en reduced motion, API fixture/mock y ninguna comunicación externa. Los casos NO PROBADO registran la causa real sin atribuirles aprobación.' : normal ? 'Evidencia geométrica y funcional local; no equivale a aceptación visual. DPR1, viewport CSS efectivo registrado. Estos recorridos usan tiempos normales de animación (no reduced motion), estados inicial/final y medios originales con reproducción/seek/fin real, comparación por arrastre/teclas y replay. No hay envíos externos; API interceptada mediante mocks explícitos.' : 'Evidencia geométrica y funcional local; no equivale a aceptación visual. DPR 1, viewport CSS efectivo registrado. Geometría final en reduced motion; secuencias normales e interacciones críticas se documentan aparte. Comercio: fixtures/mocks explícitos, sin solicitudes externas. Medios originales sin modificar; carga individual en resultados del runner.', '',
    '| Navegador/versión | Viewport | Tema | Ruta/sección | Estado | Resultado | Hallazgos |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...results.map(r=>`| ${r.browser} ${r.version||''} | ${r.viewport ? `${r.viewport.width}×${r.viewport.height}${r.viewport.width!==r.size?.[0]||r.viewport.height!==r.size?.[1]?` (inicial ${(r.size||[]).join('×')})`:''}` : (r.size||[]).join('×')} | ${r.theme} | ${r.route||'no disponible'} | ${r.state||(r.zoom?`zoom real ${r.zoom}%`:'')} | ${r.status} | ${r.cause?.replace(/\s+/g,' ').replace(/\|/g,'/')||[...new Set((r.issues||[]).map(i=>i.kind))].join(', ')||'—'} |`),
  ];
  await writeFile(process.argv[3],lines.join('\n')+'\n');
  const coordinates=results.filter(r=>r.evidence?.samples);
  if(coordinates.length) {
    let maximum=0,measurements=0,fields=0;
    for(const r of coordinates) {
      fields+=r.evidence.fields.length;
      const ids=[...new Set(r.evidence.samples.flatMap(s=>s.coords.map(c=>c.id)))];
      for(const id of ids) {
        const samples=r.evidence.samples.flatMap(s=>s.coords.filter(c=>c.id===id));measurements+=samples.length;
        for(const axis of ['x','y'])maximum=Math.max(maximum,Math.max(...samples.map(c=>c[axis]))-Math.min(...samples.map(c=>c[axis])));
      }
    }
    console.log('Coordinates:',{maximumDeltaCSSpx:maximum,measurements,focusedFields:fields});
  }
  const darkRatios=results.filter(r=>r.theme==='dark'&&r.state?.startsWith('contraste compuesto')).flatMap(r=>r.evidence.flatMap(s=>s.data.map(d=>d.ratio)));
  if(darkRatios.length)console.log('Dark menu minimum contrast:',Math.min(...darkRatios));
  if(coordinates.length) {
    const rows=[];
    for(const r of coordinates) {
      const ids=[...new Set(r.evidence.samples.flatMap(s=>s.coords.map(c=>c.id)))];
      for(const id of ids) {
        const samples=r.evidence.samples.flatMap(s=>s.coords.filter(c=>c.id===id));
        const xs=samples.map(c=>c.x),ys=samples.map(c=>c.y);
        rows.push(`| ${r.browser} | ${r.size.join('×')} | ${r.theme} | ${r.route} | ${r.state} | ${id} | ${samples.length} | ${Math.min(...xs)}…${Math.max(...xs)} | ${Math.min(...ys)}…${Math.max(...ys)} | ${Math.max(...xs)-Math.min(...xs)}, ${Math.max(...ys)-Math.min(...ys)} | ${samples.every(s=>s.hit)} | ${r.evidence.fields.length} |`);
      }
    }
    await writeFile(process.argv[3].replace(/\.md$/,'-coordinates.md'),[
      `# Coordenadas viewport durante scroll — ${date}`,'',
      '11 puntos por recorrido: 0,15,30,50,75,100,75,50,30,15,0% del scroll útil. Solo muestras donde el control está visible; aparición/desaparición no es desplazamiento. Tolerancia máxima1CSSpx. Todos los campos comprobados reciben foco y scroll al centro, verificando límite efectivo del main y hit-testing. Fixtures/mocks; DPR1; no aprobación visual externa.','',
      '| Motor | Viewport | Tema | Ruta | Estado | Herramienta | Muestras visibles | X min…max | Y min…max | ΔX, ΔY | Hit-test todas | Campos con foco |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',...rows,'',
    ].join('\n'));
  }
  const contrastRows=results.filter(r=>r.state?.startsWith('contraste compuesto')&&Array.isArray(r.evidence)).flatMap(r=>r.evidence.map(s=>
    `| ${r.browser} | ${r.size.join('×')} | ${r.theme} | ${s.id} | ${s.state} | ${s.data.length} | ${s.data.some(d=>d.ratio===null)?'NO MEDIDO: fotografía clara original':Math.min(...s.data.map(d=>d.ratio)).toFixed(3)} | ${[...new Set(s.data.map(d=>d.color))].join('; ')} | ${[...new Set(s.data.map(d=>d.background.map(v=>v.toFixed(1)).join(',')))].join('; ')} | ${[...new Set(s.data.map(d=>d.opacity))].join(',')} |`
  ));
  if(contrastRows.length)await writeFile(process.argv[3].replace(/\.md$/,'-contrast.md'),[
    `# Contraste compuesto del menú — ${date}`,'',
    'Composición alpha sobre fondos efectivos de la cadena de ancestros, seguida de opacidad de texto/ancestros y luminancia sRGB WCAG. Inicio amplio oscuro usa respaldo opaco, por lo que la fotografía no altera el fondo efectivo bajo estos enlaces. Mínimo requerido dark4.5:1 en todos los enlaces habilitados, incluidos activos; presentación clara contrastada contra sus colores/alphas anteriores. No es un audit global de contraste.','',
    '| Motor | Viewport | Tema | Superficie | Estado | Enlaces | Ratio mínimo | Color calculado (alpha incluido) | Fondos compuestos RGB | Opacidades |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',...contrastRows,'',
  ].join('\n'));
}
