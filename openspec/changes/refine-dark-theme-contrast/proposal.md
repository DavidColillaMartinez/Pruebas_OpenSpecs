## Why

Tras revisar la implementación del modo oscuro, el propietario identifica defectos de legibilidad y de acabado: la landing (nav superior y lateral, secciones Reformas/Contacto) queda ilegible en oscuro salvo la sección Inicio; el fondo oscuro es demasiado negro; las imágenes de producto "cargan" demasiado; los controles de ficha/presupuesto no se distinguen bien; el botón de cambio de tema es feo y está mal ajustado en catálogo; y el toggle y la burbuja de bienvenida deben comportarse contextualmente (transparentes con desenfoque sobre la foto de Inicio, sólidos en el resto).

## What Changes

- Recalibrar la paleta oscura hacia tonos tipo GitHub/Linear dark (fondo menos negro, superficie de cards más clara, textos menos blancos), manteniendo contraste AA.
- Adaptar al oscuro los textos, navegación superior/lateral y estados de la landing (Header, Reformas desktop/móvil, Contacto, dot-nav) mediante tokens, conservando el modo claro byte a byte.
- Suavizar las imágenes de catálogo/ficha/masthead en oscuro mediante filtros CSS acotados a `[data-theme='dark']`, sin modificar los archivos de media.
- Suavizar inputs, selects, chips, placeholders y estados de error en oscuro.
- Rediseñar `ThemeToggle` como pill con SVG sol/luna, variante contextual (blurred transparente sobre fotografía, sólido en el resto) y posición correcta junto al link "Volver a AREA LRMQ" en catálogo.
- Ajustar la burbuja de bienvenida al mismo patrón contextual y auditar su disparador con tests.
- Validar ambos temas con matriz de capturas, suite completa e informe de revisión; commit y push solo con instrucción del propietario.

## Capabilities

### New Capabilities

- `dark-theme-legibility`: Paleta oscura suave y legible, landing navegable, imágenes y controles suavizados, toggle contextual y burbuja contextual.

### Modified Capabilities

Ninguna: se añade capacidad nueva sobre la superficie de presentación existente.

## Impact

- Archivos afectados esperados: `src/styles/index.css`, `tailwind.config.js`, `src/components/Header.jsx`, `src/components/ThemeToggle.tsx` (+ test), `src/sections/desktop/Reforma​s.jsx`, `src/sections/mobile/{Reformas,Contacto,Vision?}.jsx` (Vision solo si el estado activo del dot-nav lo exige, preferentemente evitar), landing nav/dots, `CatalogPage.tsx`, `ProductDetailPage.tsx` y sus selectores, `ProductGallery.tsx`, `CatalogProductCard.tsx`, `CatalogMasthead.jsx`, `QuoteSelectionPage.tsx`, `QuoteRequestForm.tsx`, `ChatPanel.tsx`, `ChatWelcomeBubble.tsx` (+ test), NotFoundPage.
- No modificar: media/assets, CompareSlider, contenido de sections Vision, API/proxy/rutas funcionales, n8n, transporte de datos.
- El claro debe permanecer visualmente intacto: los ajustes oscuros se acotan a overrides `[data-theme='dark']` o tokens con fallback claro idéntico al actual.
