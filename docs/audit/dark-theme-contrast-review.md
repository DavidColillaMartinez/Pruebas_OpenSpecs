# Revisión — contraste y acabado del modo oscuro (`refine-dark-theme-contrast`)

Fecha: 2026-09-10 · Base: commits previos en `main` + trabajo local del change `refine-dark-theme-contrast`.

## 1. Origen

Tras revisar la primera implementación del modo oscuro, el propietario reportó: (a) landing ilegible en oscuro salvo la sección Inicio (nav superior y lateral perdidas), (b) fondo demasiado negro, (c) imágenes de producto con exceso de brillo y archivos "cargando la dinámica", (d) inputs muy blancos en ficha/presupuesto, (e) toggle feo y mal formateado, (f) en catálogo el toggle desalineado respecto al enlace Volver a AREA LRMQ, (g) toggle y burbuja de bienvenida sin sentido sobre la foto de Inicio (deberían ser transparentes con desenfoque) y sólidos en otras secciones, (h) dudas sobre el disparador de la burbuja.

## 2. Cambios aplicados

- Paleta dark recalibrada estilo GitHub/Linear: `surface 28 29 31` (antes 21), `elevated 46 47 50` (antes 34), `elevated-hover 58 59 63`, texto primario `228 226 220` (menos blanco), secundario `168 165 158`. Contraste primario/superficie ≈ 11.6:1 y secundario ≥ 6.5:1 (verdadero sobre ambas superficies). El clarísima se mantiene byte-idéntico (`:root` intacto).
- Landing adaptada a tokens (claro idéntico): Header (pill oscura en dark vía `.lrmq-nav-pill`, CTA, hamburguesa, drawer), dot-nav y textos; secciones desktop y móvil (Inicio, Quiénes somos, Colección, Reformas, Opiniones, Contacto). **Vision y CompareSlider sin variar** (0 líneas de diff).
- Sombras dark-aware (`shadow-soft/lift/glass`), grid de fondo, skip-links con fondo token.
- Estados de error dark-aware (`bg-red-50`, `text-red-700/800/900`, `border-red-200`).
- Controles nativos: en dark, `input/textarea/select` con fondo `elevated/72`, texto y placeholder suaves, `color-scheme: dark`.
- `ThemeToggle` rediseñado: pill 44×44, SVG sol/luna, variantes `floating` (vidrio translúcido con blur sobre la foto, ambos temas) y `solid` (token). Header PC usa `floating` en Inicio; catálogo integra el toggle en la misma flex-row que "Volver a AREA LRMQ" (el enlace manda; toggle `shrink-0`).
- Burbuja de bienvenida: contextual (transparente con blur+texto blanco sobre la foto de Inicio en ambos temas; sólida en otras rutas) mediante `data-lrmq-context` en `<html>`, limpiado al desmontar. Disparador congelado en tests: aparece en 1.2 s si no hubo descarte en la sesión, pausa el auto-hide con puntero/foco, auto-cierra a los 8 s marcando el descarte, y no reaparece tras abrir/cerrar manual dentro de la sesión. Reaparece en una sesión nueva.
- Imágenes de catálogo/ficha/asistente/presupuesto suavizadas solo en dark vía CSS opt-in `.lrmq-dark-soften`/`.lrmq-soften-quote` (`brightness .9 saturate .92`, transición 300 ms). Ningún archivo de media modificado.

## 3. Verificación

- Suite: 370 passed | 1 skipped (49 archivos). Lint: 0 errores / 10 warnings. `tsc -b`: OK. `vite build`: OK. `openspec validate refine-dark-theme-contrast`: válido.
- Capturas (Playwright, `/tmp/opencode/`): `darkmatrix-{light,dark}-{portada,catalogo,ficha,presupuesto,404}*.png`, `darkdot-*.png` (secciones landing dark navegadas por capítulos), `checked-movil-catalogo-{light,dark}.png` (fila enlace+toggle a 390 px), `light-nav-check.png` (pill clara intacta), `toggle-clip.png` (pill solid dark con sol SVG). Sin errores de `pageerror` en consola en ninguna captura.
- Navegador real revisado: nav/dots/secciones legibles en oscuro; suavizado perceptible en fotos de ficha y catálogo; inputs con relleno suave y texto legible; toggle vidrio sobre foto y sólido en el resto.

## 4. Límites y pendientes

- La revisión de pantallas se hizo con Chromium headless y servidor local con mock upstream (`scripts/mock-upstream.mjs`); el propietario debe validar visualmente en su navegador/dispositivos (especialmente móvil real y Safari) antes de dar por cerrado el tema.
- SEO/seguridad (etapa 1) intactos: no se tocaron proxies, rutas funcionales, metadatos ni transporte; la suite y el build en verde lo respaldan. Pendientes de plataforma siguen abiertos (BLOQ-001/002 soft-404 y 404 con marca, BLOQ-004 URL de privacidad) hasta tener hosting real.
- Identidad visual deliberada en dark: botones `bg-ink text-white`, LogoMark y foto del masthead se conservan como islas de marca.

## 5. Commits

Entrega por lotes, posterior a este informe, con instrucción explícita del propietario (commit + push ya solicitados para este change).
