## Context

El landing de AREA LRMQ (Vite + React + Tailwind, sin SSR) ya implementa una narrativa desktop con cinco capítulos (Inicio, Colección, Reformas, Visión, Contacto) y un flujo mobile/tablet en minimal. La sección Visión desktop reproduce el video del boceto (`boceto-video.mp4`) automáticamente la primera vez que el capítulo Visión se vuelve activo, bloqueando el scroll hasta que el video termina y el usuario pulsa "Revelar". Una vez pulsado, el slider de comparación aparece y la sección se vuelve interactiva.

Hoy, cada vez que el usuario sale de Visión y vuelve (incluso sin recargar la página), el `useEffect` actual del componente dispara el `play()` otra vez. Esto significa que un usuario que ya exploró la sección una vez debe verla completa de nuevo solo para llegar al slider. Es fricción gratuita.

La sección Contacto, en paralelo, tiene dos detalles pequeños de pulido:
- El ritmo de espaciado entre el bloque business (logo + nombre + dirección), los enlaces de contacto y el formulario es demasiado uniforme: `mt-8` después del título, `mt-6` antes de la lista, `mt-10` en el form. Visualmente el bloque se siente "pegado".
- Los indicadores de cada canal son abreviaturas tipográficas (`WA`, `TEL`, `IG`, `MAP`). Son legibles, pero no son iconografía. El usuario pidió iconos/emojis con microanimación de hover, en línea con la dirección aesthetic de la marca.

Stakeholders: brand (pulido visual), engineering (cero nuevas dependencias, no romper narrativa).

## Goals / Non-Goals

**Goals**
- Visión entra en modo "replay" si el usuario ya completó el video al menos una vez en la sesión actual.
- Botón replay con flecha circular animada, visible solo en estado `Revelar`.
- Más aire entre business / links / form en Contacto mobile y desktop, en ambas variantes (minimal y tarjetas).
- Iconos/emojis reales en los cuatro enlaces de contacto con microanimación de hover.
- Cero nuevas dependencias. Mantener estética minimal/sobria.

**Non-Goals**
- No se cambia la duración, formato o fuente del video.
- No se introduce `localStorage` ni `sessionStorage`. La memoria es a nivel de módulo (se resetea al recargar la web, que es la semántica pedida).
- No se cambia la sección Visión mobile.
- No se rediseña el formulario de contacto (más allá del espaciado).
- No se introduce un sistema de iconos. Los iconos son emojis unicode o SVG inline pequeños, lo que decida la implementación.
- No se modifica la narrativa desktop (Pasos 0–2 de Visión con el título moviéndose siguen igual).

## Decisions

### Decision 1: Marcar "ya visto" con un módulo-level `useRef` dentro de `Vision.jsx`

- Rationale: el estado de "ya visto" no necesita persistir más allá del componente `Vision`. Si el componente se desmonta (porque el usuario sale de la sección a través de un link que cambia `activeChapter` pero la app sigue montada), el ref módulo-level sobrevive a ese re-render, lo que es exactamente el comportamiento pedido.
- Alternativa considerada: estado en `App` o un contexto. Rechazado: añade cableado sin valor, complica el test del cambio.
- Alternativa considerada: `localStorage`. Rechazado: el usuario pidió explícitamente que se resetee al recargar.

### Decision 2: El botón replay vive dentro de `CompareSlider` como children, igual que el botón "Revelar"

- Rationale: el `CompareSlider` ya acepta un `children` slot que se renderiza dentro del contenedor del slider. Mantener la animación y posicionamiento del botón replay dentro de ese slot evita reordenar el JSX del padre.
- Alternativa: añadir un prop `topRightAction` al `CompareSlider`. Rechazado: prop adicional para un solo caso de uso, aumenta superficie de API sin ganancia.
- Implementación: pasar el botón replay como children, posicionado en la esquina superior derecha con `absolute top-3 right-3`.

### Decision 3: Animación replay con CSS puro (transform + transition)

- Rationale: mantener cero dependencias. Una flecha circular animada con `@keyframes` rotando 0° → 360° en hover, o un `hover:rotate-180 transition-transform` basta para la sensación de "volver a ver".
- Alternativa: Framer Motion. Rechazado: dependencia nueva, fuera del alcance.

### Decision 4: Iconos = emojis unicode renderizados dentro del mismo `<span>` que antes tenía la abreviatura

- Rationale: el `<span>` ya tenía `bg-.../15 text-...` con tinte. Sustituir el contenido textual por un emoji no cambia el shell CSS. Cero impacto en layout, cero riesgo de CLS.
- Emojis propuestos:
  - WhatsApp: `💬` (alternativa: `📱` o el logo oficial, pero emoji es universal y libre)
  - Teléfono: `📞`
  - Instagram: `📷` (o logo IG; emoji evita licencias)
  - Mapa: `📍`
- Nota: los emojis se renderizan con el color del texto padre, por lo que el tinte del círculo se mantiene (WhatsApp verde, IG clay, etc.).
- Alternativa: SVG inline. Considerado: más control de estilo, pero requiere un set de SVGs nuevo y trabajo extra. Diferido a un cambio posterior si la marca quiere un set propietario.

### Decision 5: Hover con microanimación "hyperframes" = combinación de scale + rotate + transition timing

- Rationale: la estética de hyperframes del sitio es "rotación + bounce + transform-origin: center". Para enlaces de contacto, una rotación de 8–12° en hover (no 180°) combinada con `scale-110` y transición de 300–400 ms con easing `cubic-bezier` transmite el mismo feeling sin sobrecargar.
- Implementación: en el `<span>` del icono, añadir `transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`. En el `<a>`, añadir `group` para que el icono reaccione al hover del link entero.

### Decision 6: Espaciado del bloque Contacto

- Plan:
  - Title + lead: mantener.
  - Business block: `mt-10` (era `mt-8`).
  - Contact links list: `mt-10` (era `mt-6`).
  - Form: `mt-16` (lo que ya está en ContactForm, mantener).
- Estos valores están en las dos secciones (`MobileContacto` y `Contacto` desktop) y en ambas variantes (minimal y tarjetas) cuando aplique. En el bloque no-minimal de Contacto (Tarjetas), ajustar de la misma forma.
- Alternativa: pasar a `space-y-*` en un contenedor padre. Considerado: simplifica pero rompe la lógica de bloques con bordes laterales en la variante minimal. Mantengo los `mt-` individuales.

## Risks / Trade-offs

- [Risk] Si el usuario recarga la web, "ya visto" se resetea y vuelve a ver el video. → Mitigation: es la semántica pedida. Si en el futuro se quiere persistir, se introduce `sessionStorage` con un flag explícito.
- [Risk] El botón replay rompe el slider si se hace clic mientras se arrastra. → Mitigation: el botón está fuera del bounding box del slider (esquina superior derecha, `top-3 right-3`), y se oculta en estados `playing` y `compare` (slider activo), por lo que no compite con el drag.
- [Risk] Emojis con tinte de fondo pueden perder contraste WCAG. → Mitigation: mantener el tinte con baja opacidad (`/15`) sobre texto de color sólido, verificar visualmente. Si el contraste falla, ajustar a `/20` o usar SVG.
- [Risk] Animación `hover:rotate-12` puede ser demasiado sutil y no notarse. → Mitigation: combinar con `scale-110` y un timing de 300–400 ms, lo que ya es perceptible.
- [Risk] Cambio de espaciado en Contacto afecta al layout responsive en 768 px. → Mitigation: usar valores `mt-` discretos que escalan con Tailwind de forma natural; build y test visual.

## Migration Plan

- Sin infraestructura que migrar. Sin nuevos env vars. Sin cambio de API.
- Los cambios entran como un commit por concern (Vision replay, Contact icons, Contact spacing) o un commit único si se prefiere. Recomendado: un commit único bajo el nombre del change.
- Rollback: revertir el commit.
- No requiere redeploy especial.

## Open Questions

- ¿La marca prefiere un set de emojis unicode o SVGs inline con su propio icono? Decisión provisional: emojis unicode, por simplicidad y porque pueden sustituirse después sin tocar layout.
- ¿El botón replay debe tener un tooltip o aria-label más explícito que "Volver a ver"? Decisión provisional: `aria-label="Reproducir video de nuevo"`, texto visible "Volver a ver".
- ¿El cambio aplica también al `MobileVision`? Decisión provisional: no. La spec solo menciona Visión desktop. Mobile Vision ya tiene su propio botón "Reproducir boceto" en estado `idle`.
