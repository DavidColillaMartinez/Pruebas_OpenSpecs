import { readFile, writeFile } from 'node:fs/promises';
const input=process.argv[2];
if(!input) throw new Error('Supply audit JSON path');
const all=(await Promise.all(input.split(',').map(async path=>JSON.parse(await readFile(path,'utf8'))))).flat();
const results=[...new Map(all.map(r=>[[r.browser,String(r.size),r.theme,r.route,r.state,r.motion||''].join('|'),r])).values()];
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
  const lines=[normal?'# Media y fases de animación locales — 2026-10-09':'# Matriz responsive local — 2026-10-09','',
    normal ? 'Evidencia geométrica y funcional local; no equivale a aceptación visual. DPR1, viewport CSS efectivo registrado. Estos recorridos usan tiempos normales de animación (no reduced motion), estados inicial/final y medios originales con reproducción/seek/fin real, comparación por arrastre/teclas y replay. No hay envíos externos; API interceptada mediante mocks explícitos.' : 'Evidencia geométrica y funcional local; no equivale a aceptación visual. DPR 1, viewport CSS efectivo registrado. Geometría final en reduced motion; secuencias normales e interacciones críticas se documentan aparte. Comercio: fixtures/mocks explícitos, sin solicitudes externas. Medios originales sin modificar; carga individual en resultados del runner.', '',
    '| Navegador/versión | Viewport | Tema | Ruta/sección | Estado | Resultado | Hallazgos |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...results.map(r=>`| ${r.browser} ${r.version||''} | ${r.viewport ? `${r.viewport.width}×${r.viewport.height}${r.viewport.width!==r.size?.[0]||r.viewport.height!==r.size?.[1]?` (inicial ${(r.size||[]).join('×')})`:''}` : (r.size||[]).join('×')} | ${r.theme} | ${r.route||'no disponible'} | ${r.state||''} | ${r.status} | ${r.cause?.replace(/\s+/g,' ').replace(/\|/g,'/')||[...new Set((r.issues||[]).map(i=>i.kind))].join(', ')||'—'} |`),
  ];
  await writeFile(process.argv[3],lines.join('\n')+'\n');
}
