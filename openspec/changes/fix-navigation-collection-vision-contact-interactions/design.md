## Context

El proyecto es una landing React/Vite con narrativa desktop por capítulos. En desktop, `useNarrativeScroll` controla `activeChapter`, `step`, `smoothProgress` y `navigateTo`; `App.jsx` pinta `ChapterDots` como un `div fixed right-4` con spans pasivos. La sección Colección es una sección `step` que actualmente usa `s >= 4`, `s >= 5`, `s >= 6` y `s >= 7` para revelar bloques por separado. Visión ya tiene botón replay, pero está en `top-3 right-3` y puede quedar cortado o visualmente mal colocado. Contacto usa un componente `ContactIcon.jsx` reciente, pero algunos SVGs son confusos y las animaciones no se activan o no se leen correctamente.

Restricciones: no añadir dependencias; mantener estética sobria/premium; usar CSS/SVG; respetar `prefers-reduced-motion`; no cambiar mobile Vision; commitear/pushear con los datos de Git del usuario cuando se implemente.

## Goals / Non-Goals

**Goals:**
- Hacer el navegador lateral de desktop clicable y accesible sin cambiar la arquitectura de scroll.
- Cambiar el label del navegador lateral en hover/focus con una transición suave, volviendo al label activo al salir.
- Agrupar la aparición de los tres bloques finales de Colección en una sola acción de scroll con stagger visual.
- Reubicar replay de Visión en esquina inferior derecha y asegurar que su icono gira claramente al hover/focus.
- Rehacer iconos de Contacto para que WhatsApp, teléfono, Instagram y mapa sean reconocibles y animen de forma fiable.
- Verificar build, commit y push.

**Non-Goals:**
- No añadir Framer Motion, GSAP ni Hyperframes runtime.
- No modificar el modelo de capítulos completo ni la navegación mobile.
- No rediseñar Colección, Visión o Contacto más allá de las interacciones pedidas.
- No cambiar textos, URLs de contacto, assets o estructura SEO.

## Decisions

### Decision 1: `ChapterDots` usa botones nativos y estado hover/focus local

`ChapterDots` recibirá `onNavigate` y renderizará un `<button>` por sección. Cada botón tendrá `aria-label="Ir a <sección>"`, `aria-current` para el activo y `type="button"`. El label mostrado será `labels[hovered ?? active]`. `hovered` se actualiza con `onMouseEnter`/`onFocus`, y se limpia con `onMouseLeave`/`onBlur`.

Rationale: botón nativo resuelve click, teclado y foco sin inventar roles. Mantener el estado en `ChapterDots` evita tocar `useNarrativeScroll` salvo pasar `navigateTo` desde `App.jsx`.

Alternativa rechazada: convertir spans en anchors con `href`. En desktop la página está controlada por transform y `100svh`; `navigateTo` ya es la API correcta.

### Decision 2: transición del label mediante key o doble capa simple

El label puede implementarse con un `<span key={displayedLabel}>` y clases `transition-all duration-300`, o con un contenedor que cambia texto y usa `opacity/translate-y` breve. Si el key remount genera entrada limpia, es suficiente. Si parpadea, usar dos capas absolutas no es necesario salvo que se detecte visualmente.

Rationale: la petición pide suavidad, no una coreografía compleja. El movimiento debe ser discreto.

### Decision 3: Colección agrupa los bloques finales en `s >= 5`

Mantener intactos:
- Imagen/card principal `Vidrio templado`: `s >= 2` y texto `s >= 3`.
- `Textura mineral`: `s >= 4`.

Cambiar los tres siguientes bloques para depender de un único umbral, por ejemplo `const revealTail = s >= 5`, y usar delays escalonados:
- Líneas puras: `delay-0`.
- Siguiente bloque: `delay-150`.
- Aside/final: `delay-300`.

Rationale: un solo scroll pasa de `step 4` a `step 5`, y el orden se conserva por CSS delay sin pedir más gestos. Se mantiene la narrativa de primeros dos bloques.

Alternativa rechazada: reducir `chapterSteps` global de Colección. Eso puede afectar navegación hacia atrás y otros capítulos; el cambio de umbrales es menor y reversible.

### Decision 4: replay a `bottom-3 right-3` con animación de giro directa

El botón replay se moverá a `absolute bottom-3 right-3`. La clase CSS debe animar el icono real (`.replay-arrow`) con `rotate(360deg)` en hover/focus. El anillo orbit opcional puede quedarse si no corta ni distrae, pero la señal principal debe ser el giro del icono.

Rationale: esquina inferior derecha reduce conflicto con overlays superiores y evita corte. Una animación directa de recarga es más clara que órbita/traslación compleja.

### Decision 5: ContactIcon usa SVGs simples y separados por canal

Refactor de `ContactIcon.jsx`:
- WhatsApp: burbuja circular + teléfono interno, sin path duplicado ni trazos que se confundan.
- Teléfono: handset limpio.
- Instagram: rounded square + lente + punto, sin `rect` flash que tape el icono en reposo. El flash debe ser un elemento pequeño/diagonal o pseudo visual con opacidad 0.
- Mapa: mapa plegado y pin separados, evitando que el pin y el mapa compartan formas que parezcan fusionadas.

Rationale: los SVGs deben leerse a 20-24px. Menos trazos es mejor.

### Decision 6: animación ligada al wrapper correcto

Los anchors ya usan `group`; las clases CSS deben apuntar a `.group:hover .contact-icon--x ...` y `.group:focus-visible .contact-icon--x ...`. Para iconos dentro de círculos y minimal, el wrapper `ContactIcon` conservará `display:inline-block; line-height:0`. Evitar `will-change` persistente salvo en hover si se vuelve necesario.

Rationale: el bug actual parece venir de SVGs confusos y selectors que no logran un resultado visible. Selectores por canal y targets internos hacen la animación verificable.

## Risks / Trade-offs

- [Risk] Botones laterales pueden interferir con scroll o focus visual. → Mitigation: usar botón pequeño con `focus-visible` claro y no añadir listeners globales nuevos.
- [Risk] Colección todavía tendrá steps sobrantes si `chapterSteps` queda igual. → Mitigation: aceptar un step final sin cambios visibles solo si no se nota; preferir ajustar umbrales y, si procede, `chapterSteps` de Colección tras probar navegación hacia adelante/atrás.
- [Risk] Animaciones de contacto pueden sentirse excesivas. → Mitigation: duraciones cortas (250-500 ms), transforms pequeños, reduced motion.
- [Risk] Force/push con autor incorrecto. → Mitigation: antes de commit, verificar `git log` y usar configuración existente del repo/usuario; no usar `-c user.name=opencode`.

## Migration Plan

- Implementar cambios en componentes/CSS.
- Ejecutar `npm run build`.
- Verificar `git status`, `git diff`, `git log --oneline --format='%h %an <%ae> %s' -3`.
- Commit con autor del usuario y mensaje conciso.
- Push a `origin main`.
- Rollback: revertir el commit.

## Open Questions

- Si al implementar se detecta que `chapterSteps` de Colección deja un gesto adicional sin efecto, decidir si reducir el número de steps del capítulo o dejarlo para no tocar el motor de scroll. Preferencia inicial: evitar tocar el motor salvo que el gesto extra sea visible.
