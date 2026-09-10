# Design — fix-nav-pill-context-and-chat-scroll

## 1. Pill de navegación condicional

Estado actual (`Header.jsx:44`): `lrmq-nav-pill rounded-full border border-white/70 bg-elevated-hover/90 shadow-lift transition-all ...` en ambas ramas de `isInicio`, con padding condicional.

Nuevo (basado en el estilo existente, sin restaurar código histórico):

```
Base: 'lrmq-nav-pill?→ solo rama no-inicio' rounded-full transition-all duration-500 ease-out
isInicio   : 'rounded-full border border-white/60 px-6 py-3'
no-Inicio  : 'lrmq-nav-pill rounded-full border border-white/70 bg-elevated-hover/90 shadow-lift px-4 py-3'
```

- En Inicio (claro y oscuro): fondo transparente y sin sombra; el borde hairline claro reproduce la referencia del propietario. Los enlaces ya usan `text-secondary/88 → text-primary` y el CTA/pill de asesoría y el ThemeToggle ya usan su aspecto de vidrio sobre foto.
- En el resto: son exactamente los valores vigentes aprobados; `.lrmq-nav-pill` se mantiene como clase del override dark (`background rgba(46,47,50,.88)`, borde translúcido, sombra dark) pero solo se emite en la rama no-Inicio.
- El override dark en `index.css` no necesita cambios de valor; se ajusta su comentario.

## 2. Scroll con el chat abierto

`ChatPanel.tsx:55-62` aplica `document.body.style.overflow='hidden'` al abrir. El panel es una ventana fija flotante (`fixed bottom-24 right-4`, ancho `24rem`, no overlay a pantalla completa), por lo que el scroll de fondo debe seguir operando: se elimina el efecto completo (y su restauración asociada). No se altera `assistant-scroll` interno ni el foco/A11y del diálogo.

## 3. Tests

- `ChatPanel.test.tsx` "marks the panel as a modal dialog and locks the body scroll while open" → "marks the panel as a modal dialog without locking background scroll": `body.style.overflow` permanece `''` con el panel abierto y tras desmontar.
- Verificación Playwright: ventana flotante abierta + `window.scrollBy` mueve la página (scrollTop > 0).

## Riesgos

- Móvil: el panel ocupa gran parte de la pantalla pero nunca fue un overlay; el scroll de fondo no rompe la conversación (estado ya probado robusto ante remontes). Se valida con suite y captura manual.
