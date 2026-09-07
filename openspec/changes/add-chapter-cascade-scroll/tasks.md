## 1. Baseline y datos de capítulos

> Nota de alcance (AGENTS.md): este change toca más de cinco ficheros de forma unavoidable porque redefine la máquina de narrativa (hook + copy + todas las secciones `step` + dos capítulos nuevos + 3 superficies de navegación). El motivo está en `proposal.md`/`design.md`; ninguna modificación es cosmética sobre secciones ajenas.

- [x] 1.1 Ejecutar `git status` y confirmar que solo están los 3 cambios preexistentes (`assets/Boceto/Imagen_Original.png`, `openspec/changes/fix-vercel-catalog-api-routing/tasks.md`, `assets/Catalogo/`); no tocarlos ni comitearlos.
- [x] 1.2 Correr `npm test` (base: 29 archivos / 178 tests) y capturar screenshots de la landing actual sin cambios (desktop ≥1024×720 y móvil) como referencia light-mode para la validación posterior. *Nota: baseline de tests capturado (178 ✓); sin navegador/Playwright en este entorno, las capturas de referencia no fueron posibles y quedan para 6.2.*
- [x] 1.3 Ampliar `src/data/copy.js` a 7 capítulos en orden `inicio, quienes-somos, coleccion, reformas, vision, opiniones, contacto` con `chapterSteps [1,3,5,0,1,2,1]`, `chapterType ['step','step','step','continuous','step','step','step']` y `navItems`/`chapterLabels` coherentes (D5).
- [x] 1.4 Crear `src/data/aboutContent.js` (3 bloques titular/texto/imagen, con imágenes reutilizadas de assets existentes del repo) y `src/data/reviewsContent.js` (`{ author, rating, text, googleUrl }`). Marcar los textos de empresa y las reseñas como **pendientes de aprobación del propietario**: no inventar contenido; la implementación visual puede avanzar con estructura vacía y keys documentadas.

## 2. Máquina de cascada en useNarrativeScroll

- [x] 2.1 Implementar en `src/hooks/useNarrativeScroll.js` la máquina `entering → cascading → revealing → complete` por entrada de capítulo (D2): refs de temporizador únicos con `CASCADE_INITIAL_DELAY_MS = 1000` e intervalo `CASCADE_STEP_MS ≈ 900`, auto-avance de `step` hasta `chapterSteps[i]`, y flag `chapterComplete` persistido por capítulo.
- [x] 2.2 Cambiar `onWheel`/`onKey`: en capítulos `step` incompletos `preventDefault` e ignorar (sin avanzar pasos); en completos navegar ±1 con el cooldown existente; Reformas (`continuous`) sin cambios de comportamiento (D2).
- [x] 2.3 Exponer API `startCascade(index)` / hold por capítulo: Vision e Inicio piden el arranque al terminar su gate; el resto arranca tras 1 s; `replayCascade` para Visión (cada entrada tras boceto visto: 1 s con titular y nueva cascada, D2/D3).
- [x] 2.4 `prefers-reduced-motion` o no-desktop: `step` salta a completado al entrar, sin bloqueo; `navigateTo` cancela temporizadores pendientes y navega siempre (válvula de escape).
- [x] 2.5 Tests nuevos del hook con fake timers: auto-avance, bloqueo hasta `complete`, re-entrada sin re-cascada (salvo Visión), escape por `navigateTo`, Reformas intacto, reduced-motion (D7).

## 3. Gates de Inicio y Visión

- [x] 3.1 Añadir `onAnimationEnd` a `src/components/AnimatedLogoMark.jsx`: calcular `max(delay+duration)` de los trazos y disparar un `setTimeout` (fallback inmediato con reduced motion o `document.hidden` al volver a visible); test del evento.
- [x] 3.2 `src/sections/desktop/Inicio.jsx`: estado `logoDone`; los tres artículos solo reciben `s>=1` cuando `logoDone`; `transitionDelay` 0/800/1600 → 0/320/640 ms; contenedor `bottom-0 pb-32` → `pb-20 sm:pb-24`; sin otros cambios de estilo (D4).
- [x] 3.3 `src/sections/desktop/Vision.jsx`: en `finishPlayback` y en el gate de boceto ya visto, llamar `startCascade(vision)`; mantener vídeo/`setBlocked`/`CompareSlider` sin tocar la parte visual (requisitos de spec landing-scroll-cascade); ajuste de `Vision.test.jsx`.
- [x] 3.4 Verificar `App.jsx`: pasar `startCascade`/`logoDone` wiring y props `step`/`isActive` a los nuevos capítulos (índices recalculados por `sectionIds`).

## 4. Nuevos capítulos

- [x] 4.1 Crear `src/sections/desktop/QuienesSomos.jsx`: titular + 3 bloques (texto izquierda/imagen derecha centrado, texto derecha/imagen izquierda, texto izquierda/imagen derecha) condicionados a `step` con las transiciones existentes (GoldLabel, tipografías actuales) y `aria-labelledby` propio.
- [x] 4.2 Crear `src/sections/desktop/Opiniones.jsx`: eslogan "Juzga tú mismo" + carrusel (región `aria-roledescription="carousel"`, prev/next accesibles, puntos, estrellas SVG con `aria-label`, enlace "Ver en Google", autoplay off con reduced motion).
- [x] 4.3 Crear variantes móviles `src/sections/mobile/QuienesSomos.jsx` y `src/sections/mobile/Opiniones.jsx` con `MobileSectionShell` y flujo apilado normal, swipe horizontal en el carrusel (D6).
- [x] 4.4 Tests de render: alternancia y orden en Quiénes somos, estructura/accesibilidad del carrusel, revelado por `step` de ambos capítulos en escritorio, y presencia en móvil.

## 5. Integración de navegación

- [x] 5.1 Comprobar que `ChapterDots`, `Header`/`navItems` (2 nuevas entradas con navegación programática por índice) y el `IntersectionObserver` móvil funcionan con 7 `sectionIds`; ajustar `MobileDrawer` si lista algo fijo.
- [x] 5.2 Mantener `Tienda -> /productos` y anclas profundas (`#coleccion`, `#contacto`…) resolviendo al capítulo correcto con el nuevo orden; test de resolución de anclas si existe helper, o ajuste de `App.test.jsx`/`LandingPage.test.jsx` por índices.
- [x] 5.3 Tests de navegación: 7 puntos con `aria-current`/hover label, clic en punto durante cascada navega y cancela timers, drawer móvil cierra y resalta.

## 6. Validación y entrega

- [x] 6.1 `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` en verde.
- [ ] 6.2 Revisión visual obligatoria (AGENTS.md): capturas desktop y móvil del estado light ANTES (1.2) y DESPUÉS, capítulo a capítulo; probar rodando de verdad: rueda durante cascada (bloqueada), puntos laterales, header, drawer, Vision primera visita vs regreso, Inicio con reduced motion, Reformas scrub intacto, y que ningún capítulo actual perdió/asumió diferencias estéticas.
- [ ] 6.3 Ajustar `CASCADE_STEP_MS`/retardos solo si alguna cascada se siente atrapante (Colección 5 pasos es el peor caso); documentar valores finales en design.md si cambian.
- [ ] 6.4 Inspeccionar `git status`/`git diff` (sin incluir los 3 preexistentes), commit focalizado `feat(landing): chapter cascade scroll with Quiénes somos y Opiniones`; push únicamente si el propietario lo pide.
- [ ] 6.5 Dejar pendientes reales como pendientes: textos de marca y reseñas de Google confirmados por el propietario antes de publicar; registrar evidencia de aceptación solo cuando exista.
