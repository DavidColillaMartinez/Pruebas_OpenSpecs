# Revisión — pill de navegación contextual y scroll con el chat abierto (`fix-nav-pill-context-and-chat-scroll`)

Fecha: 2026-09-10 · Base: `becb572`.

## 1. Pill de navegación (referencia visual del propietario)

- **Antes**: fondo + sombra en todas las secciones (error introducido al adaptar el dark).
- **Ahora** (`src/components/Header.jsx`): en **Inicio** (claro y oscuro) la pill es transparente, sin sombra, con solo el borde hairline claro (`border-white/60`), como en la captura de referencia. En **secciones sin fotografía** se conserva el estilo aprobado en el commit anterior: claro `bg-elevated-hover/90 + shadow-lift`, dark glass `rgba(46,47,50,.88)` vía `.lrmq-nav-pill`, que ahora solo se emite en esa rama. Textos, CTA y ThemeToggle no cambian.
- Verificado con estilos computados y capturas (`/tmp/opencode/navfix-{light,dark}-{inicio,seccion}.png`): Inicio sin fondo; secciones idénticas a lo aprobado en `becb572`.

## 2. Scroll con el chat abierto

- Causa: `ChatPanel.tsx` aplicaba `document.body.style.overflow='hidden'` al abrir (innecesario: el panel es una ventana flotante, no un overlay).
- Solución: efecto eliminado. El chat mantiene su scroll interno, conversación, borrador y foco.
- Verificado con Playwright (catálogo, dark): con el panel abierto, la rueda desplaza la página 0→500 px, `body.style.overflow` queda vacío, la conversación se conserva. Test de accesibilidad actualizado al nuevo contrato (`aria-modal` se mantiene; sin lock). Nota: en Inicio desktop el scroll narrativo no usa scroll nativo (diseño preexistente).
- Suite: 370 passed | 1 skipped (49 archivos); lint 0 errores/10 warnings; `tsc -b` y `vite build` OK; `openspec validate fix-nav-pill-context-and-chat-scroll` válido.

## 3. Pendientes

- Validación visual del propietario en su navegador (especialmente Inicio en oscuro con el borde hairline sobre foto).
