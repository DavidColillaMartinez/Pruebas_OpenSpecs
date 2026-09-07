## Context

La landing desktop es un stack de capítulos a pantalla completa (`src/App.jsx` → `ChapterDots` + contenedor con `translateY(-100svh * activeChapter)`) gobernado por `useNarrativeScroll` (`src/hooks/useNarrativeScroll.js`). Los capítulos se declaran en `src/data/copy.js` con `sectionIds`, `chapterLabels`, `chapterSteps` `[1,5,0,1,1]` y `chapterType` `['step','step','continuous','step','step']`. Hoy, en capítulos `step`, cada giro de rueda suma ±1 a `step` (0..`chapterSteps[i]`) y solo al exceder el máximo se navega al capítulo siguiente; las secciones (`Coleccion`, `Inicio`, `Vision`, `Contacto`) revelan bloques con clases condicionadas a `step` (`s >= N ? 'opacity-100 …' : 'opacity-0 …'`), todas con transiciones CSS de 500-700 ms. `Reformas` es `continuous`: el scroll controla `smoothProgress` (scrub del vídeo) y no se toca. `Vision` gatea su entrada con reproducción del vídeo del boceto vía `setBlocked(true/false)` y `visionSeenRef`; `Inicio` revela los tres pasos con `s>=1` y `transitionDelay` escalonado de 0/800/1600 ms. La navegación superior (`Header.jsx`, `navItems`) y el drawer móvil consumen las mismas listas; los puntos laterales iteran `sectionIds`. En móvil no hay narrativa: `MobileSections` apila las secciones con scroll natural y un `IntersectionObserver` marca la sección activa por `sectionIds`.

Restricciones (AGENTS.md): no alterar estética, copy ni visuales de aparición existentes; cambios mínimos; no tocar `assets/Catalogo/**`, `assets/Boceto/**`, `public/boceto-final.png`, `CompareSlider.jsx` ni las secciones Vision de móvil/escritorio en su parte visual; validación visual con captura antes de dar por hecho; commits focalizados sin push salvo pedido.

## Goals / Non-Goals

**Goals:**
- Scroll (rueda y flechas) = únicamente cambiar de capítulo; dentro del capítulo, el contenido se revela solo en cascada con las mismas animaciones actuales.
- No permitir cambiar de capítulo mientras el capítulo activo no haya terminado de revelarse; Reformas conserva su scroll continuo intacto.
- Vision: primera vez boceto → al terminar encadena la cascada; ya visto → 1 s con el titular y arranca la cascada.
- Inicio: los tres pasos esperan al fin de la animación del logo, aparecen con escalas de retardo ligeramente más rápidas y el bloque se desplaza algo hacia arriba (más cerca del H1).
- Nuevos capítulos "Quiénes somos" (antes de Colección) y "Opiniones" (antes de Contacto) integrados en navegación superior, puntos laterales y móvil.

**Non-Goals:**
- Cambiar aspecto, tipografía, imágenes, copy o transiciones existentes (más allá del desplazamiento vertical del bloque de pasos de Inicio y sus retardos, explícitamente pedidos).
- Introducir narrativa por capítulos en móvil (sigue scroll apilado).
- Modificar catálogo, API, proxy, n8n ni rutas.
- Reescribir `Reformas` o `CompareSlider`.

## Decisions

### D1. La cascada es auto-avance de `step` en `useNarrativeScroll`, no refactor de secciones
Las secciones siguen leyendo `step` igual que hoy; el hook programa los incrementos por temporizador (`setTimeout` encadenado: retardo inicial `CASCADE_INITIAL_DELAY_MS = 1000`, intervalo `CASCADE_STEP_MS ≈ 900` entre pasos). Alternativa considerada: timers dentro de cada sección — descartada porque duplicaría lógica, dispersaría el estado de "capítulo completo" y rompería el bloqueo de navegación centralizado. Cero cambios visuales: las mismas clases condicionadas a `step` se disparan solas.

### D2. Máquina de estados por entrada al capítulo
Estados: `entering` (0..1 s, nada de cascada) → `cascading` (step sube) → `revealing` (step en máx., esperar la última transición CSS ~600-800 ms, y en Inicio los delays escalonados) → `complete`. `chapterComplete: boolean[]` vive en un ref del hook. Reglas:
- `wheel`/teclas en capítulo `step` no-incompleto: `preventDefault` y se ignoran (el scroll ya no avanza pasos ni cambia de capítulo hasta `complete`).
- En capítulo `step` completo: un gesto de rueda navega ±1 capítulo (con cooldown actual de ~420 ms); al volver, el capítulo entra en modo "completado" (step máximo inmediato, sin re-cascada) para no ocultar contenido al usuario. Al volver a entrar hacia adelante también; la re-cascada solo ocurre en la primera visita de la sesión.
- Excepción Vision según requisito del usuario: al volver, si el boceto ya se vio, se muestra el titular 1 s y se re-ejecuta la cascada del paso (el vídeo no se repite). Esto se implementa como flag por capítulo `replayCascade: { vision: true }`: Vision se re-cascada en cada entrada tras 1 s; el resto de capítulos se marca completo tras la primera cascada.
- `navigateTo` (puntos laterales/header) es la válvula de escape en cualquier estado: navega siempre, cancela el temporizador pendiente del capítulo origen y arranca el ciclo del destino. Nunca se bloquea la navegación por clic.
- Reformas (`continuous`): la máquina no aplica; comportamiento idéntico al actual, incluida la entrada/salida por scroll acumulada.
- `prefers-reduced-motion` o `!isDesktop`: `step` salta directo al máximo al entrar (sin timers), nunca hay bloqueo.

### D3. Señal "listo para cascada" desde las secciones (Vision e Inicio)
El hook expone además de `setBlocked` un callback `startCascade(index)` (o equivalente `onCascadeReady`) que `App.jsx` pasa como prop. Vision llama a `startCascade` en `finishPlayback` (fin/error/skip del vídeo) y, cuando el boceto ya fue visto, no llama: el hook lanza su retardo de 1 s estándar al entrar (comportamiento ya pedido). Inicio mantiene `blockedRef`/hold hasta que `AnimatedLogoMark` comunique el fin: el componente calcula `totalMs = max(delay+duration)` sobre sus trazos (ya lo hace el layout existente) y dispara `onAnimationEnd` con un `setTimeout` (inmediato con reduced motion); `Inicio` lo usa como `logoDone` y llama a `startCascade(inicio)` cuando el logo termina. Los capítulos sin gate (Colección, Quiénes somos, Opiniones, Contacto) usan solo el retardo de 1 s. Alternativa: hacer que el hook "adivine" duraciones por capítulo con constants duplicadas — descartada por frágil.

### D4. Inicio: revelado gated, escalas más rápidas y bloque 40-56 px más arriba
Mismo markup y clases; los `transitionDelay` pasan de 0/800/1600 ms a ~0/320/640 ms ("ligeramente más rápido") y el contenedor `bottom-0 pb-32` sube a `pb-20 sm:pb-24` (≈48 px) con el H1 intacto. El gating real es `logoDone` (D3): los artículos solo reciben `s>=1` cuando el logo terminó. Si la cascada del resto llegara antes, `step` no avanza. Riesgo estético mínimo y localizado en la sección; requiere validación visual desktop+mobile (en móvil el bloque no existe, solo desktop).

### D5. Datos y orden de capítulos nuevos
`copy.js` pasa a 7 entradas, en orden: `inicio, quienes-somos, coleccion, reformas, vision, opiniones, contacto`; `chapterSteps` propuesto `[1,3,5,0,1,2,1]` (Quiénes somos revela sus 3 bloques tras el titular en pasos 1-3; Opiniones: carrusel en 1, pista de navegación en 2) y `chapterType` `['step','step','step','continuous','step','step','step']`. `navItems`/`chapterLabels` en el mismo orden; `ChapterDots` y el `IntersectionObserver` móvil se alimentan solos de `sectionIds`. Nuevos ficheros: `src/sections/desktop/QuienesSomos.jsx`, `src/sections/desktop/Opiniones.jsx`, `src/sections/mobile/QuienesSomos.jsx`, `src/sections/mobile/Opiniones.jsx`, `src/data/aboutContent.js`, `src/data/reviewsContent.js`. El contenido textual de Quiénes somos y las reseñas reales de Google (autor, texto, estrellas, fecha, enlace) las aporta el propietario: hasta tenerlas, los data files llevan entradas marcadas como pendientes, sin inventar testimonios (guardrail). Layout Quiénes somos: 3 filas grid `1fr 1fr` alternando (texto izquierda/imagen derecha centrado vertical, texto derecha/imagen izquierda, texto izquierda/imagen derecha), tipografías y componentes (`GoldLabel`, `Button`) existentes, imágenes reutilizadas de assets ya en el repo (no se toca `assets/Catalogo/**`; si el propietario quiere fotos nuevas, queda fuera de este change). Opiniones: carrusel con `role="region"` + botones prev/next accesibles, paginación por puntos, tarjetas con nombre, estrellas (SVG inline ARIA `aria-label="X de 5 estrellas"`), texto y enlace "Ver en Google"; autoplay opcional desactivado por defecto y pausado con reduced motion; swipe horizontal en móvil.

### D6. Móvil: los nuevos capítulos se apilan, sin narrativa
`MobileSections` añade `<MobileQuienesSomos />` tras `MobileInicio` y `<MobileOpiniones />` antes de `MobileContacto`, con `MobileSectionShell` como las secciones existentes. Sin cascada ni bloqueo (el scroll móvil ya es natural). El resaltado de sección activa funciona automáticamente al recorrer `sectionIds`.

### D7. Pruebas
Test unitario del hook con fake timers: entrada → step sube solo; transición bloqueada hasta `complete`; `navigateTo` escapa en cualquier momento; Reformas no cambia; reduced motion salta a completado; re-entrada Vision re-cascada tras 1 s. Tests de render: Vision llama `startCascade` en `ended`; Inicio no revela pasos sin `logoDone`; Quiénes somos/Opiniones muestran sus datos y su revelado por `step`; navegación lista 7 entradas y `aria-current`. Mantener los 178 tests actuales; ajuste mínimo de `App.test.jsx`/`LandingPage.test.jsx` si indexan capítulos por posición. Validación visual obligatoria (desktop+mobile, light mode) antes de commit, según AGENTS.md.

## Risks / Trade-offs

- [El usuario se siente atrapado durante la cascada] → La navegación por puntos/header nunca se bloquea; tras completar, el capítulo queda completo y el siguiente gesto ya navega; retardos son constantes afinables (1 s + ~0,9 s/paso); Colección (5 pasos) es el caso más largo (~5-6 s) y se valida con capturas + prueba manual.
- [Timers de cascada compitiendo con `navigateTo` rápido] → Un único ref de temporizador cancelado en cada entrada/navegación; el estado vive en refs para evitar closures obsoletos.
- [Cambiar `sectionIds` rompe navegaciones y tests que asumen índices (Header, ChapterDots, observer móvil, `App.test.jsx`)] → Centralizar todo en `copy.js`, añadir tests de orden, y ejecutar la suite completa para detectar acoplamientos por posición.
- [Inicio: el `onAnimationEnd` del logo nunca dispara si el navegador no ejecuta el timeout bajo pestaña oculta] → Fallback: si `document.hidden`, marcar `logoDone` al hacer visible la página; los reveals CSS son `forwards` así que el contenido no depende del evento una vez completado.
- [Opiniones con reseñas placeholders] → Bloquear la tarea de contenido al feedback del propietario (guardrail de no inventar evidencia); la estructura puede mergearse solo con testimonios reales aprobados.
- [Bloqueo de scroll confunde en dispositivos con trackpad (wheel events repetidos)] → El cooldown existente (~420 ms) ya amortigua; el bloqueo dura solo lo que la cascada.

## Migration Plan

1. Landings nuevas en rama/foco: el change solo toca `src/`, `src/data` y tests; sin migración de datos ni dependencias nuevas.
2. Rollback: `git revert` del commit del change (los capítulos nuevos son aditivos; revert de `copy.js` restaura los 5 originales). Sin datos que migrar.
3. Orden de entrega: hook + gating primero (comportamiento), luego Inicio/Vision gates, después los dos capítulos nuevos, por último navegación/móvil y ajustes de tests.

## Open Questions

- Contenido exacto de los 3 textos de "Quiénes somos" y las 3 imágenes concretas a reutilizar del repo (o fotos nuevas que aporte el propietario).
- Reseñas reales de Google para el carrusel: ¿las proporciona el propietario (texto/estrellas/enlace) o se quiere un feed/API? Este change asume contenido estático aportado.
- Número y orden finales de pasos de cascada de los capítulos nuevos (`chapterSteps [1,3,5,0,1,2,1]` propuesto).
- ¿Confirmar que el titular de Quiénes somos/Opiniones no tiene label previo que reutilizar de otra web del negocio?
