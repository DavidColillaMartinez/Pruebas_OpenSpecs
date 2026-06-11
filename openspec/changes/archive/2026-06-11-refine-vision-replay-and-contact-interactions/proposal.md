## Why

Visión en desktop obliga al usuario a ver el video del boceto cada vez que vuelve a la sección, incluso cuando ya conoce el resultado. El bloque de Contacto está visualmente apretado entre el formulario, los datos de negocio y los enlaces, y las etiquetas `WA` / `TEL` / `IG` / `MAP` se sienten como taquigrafía técnica, no como iconografía de marca. Dos detalles pequeños, una fricción real.

## What Changes

- **Visión desktop**: introducir un estado de "ya visto en esta sesión". La primera vez que el usuario entra a Visión, reproduce el video. Si sale de la sección y vuelve a entrar (en la misma sesión, sin recargar la página), entra directamente en estado `Revelar`, no en `Reproducir`.
- **Visión desktop**: añadir un botón de "volver a ver" con flecha circular animada, visible solo en estado `Revelar` (no durante `Reproducir` ni en `Arrastrar para comparar`).
- **Contacto**: ampliar la separación entre el bloque business (logo + AREA LRMQ Tienda + dirección), la lista de enlaces y el formulario, en ambas variantes (minimal y tarjetas) y en mobile y desktop.
- **Contacto**: reemplazar las abreviaturas textuales `WA`, `TEL`, `IG`, `MAP` por iconos/emojis con significado visual propio. Mantener WhatsApp verde, Instagram clay, tel y mapa con tinte grafito. Incluir microanimación de hover al estilo hyperframes (rotación/escala controlada, sin librerías).
- No se introducen dependencias. No se rompe la narrativa desktop. No se cambia la forma del form. No se añaden requisitos de accesibilidad nuevos más allá de los 44 px de tap target y focus rings ya existentes.

## Capabilities

### New Capabilities

- `vision-replay-state`: comportamiento de "ya visto en la sesión" para la sección Visión desktop, con un botón de "volver a ver" y su animación.
- `contact-link-icons`: iconos/emojis en los enlaces de contacto (WhatsApp, Tel, Instagram, Mapa) y microanimación de hover.
- `contact-section-spacing`: ritmo de espaciado interno del bloque Contacto entre business / links / form.

### Modified Capabilities

- (ninguna; no hay specs raíz previos a los que se les modifiquen REQUIREMENTS a nivel de capacidad existente).

## Impact

- `src/sections/desktop/Vision.jsx` — añadir un módulo-level `useRef` (o estado en App) para `visionSeen`, lógica de auto-arranque según el flag, y el botón de replay con flecha.
- `src/components/CompareSlider.jsx` (opcional) — exponer un slot para overlays adicionales o un prop `topRightAction` para el botón replay.
- `src/sections/mobile/Contacto.jsx`, `src/sections/desktop/Contacto.jsx` — ajustar separaciones y reemplazar `<span>` con abreviaturas por iconos/emojis.
- `src/components/ContactLinks.jsx` y/o las dos secciones de Contacto — si el patrón se reutiliza, mover iconos a `data/copy.js` o a un nuevo `data/contactIcons.js` para no duplicar el icono en dos sitios.
- `src/styles/index.css` o `src/styles/utilities.css` — posibles utilidades de animación de hover (keyframes, transform).
- No hay impacto en `index.html`, JSON-LD, performance, SEO, ni en la sección mobile Vision.
- No hay impacto en el build de Vite ni en la pipeline de Tailwind.
