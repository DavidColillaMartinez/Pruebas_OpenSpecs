# Tasks — refine-dark-theme-contrast

## 1. Paleta y base

- [x] 1.1 Recalibrar valores dark en `src/styles/index.css` (surface 28/31, elevated 47/50, primary E4E2DC, secondary legible) con contraste AA verificado
- [x] 1.2 Overrides dark para sombras (`shadow-soft/lift/glass`), grid de fondo y pill de navegación (`lrmq-nav-pill`)
- [x] 1.3 Estados de error dark-aware (`bg-red-50`, `text-red-*`, `border-red-200`) sin tocar el claro
- [x] 1.4 Controles nativos (input/textarea/select) con fondo suave dark + `color-scheme: dark` y placeholders

## 2. Landing legible en oscuro

- [x] 2.1 Convertir Header (desktop/móvil), MobileDrawer, dot-nav y skip-links a tokens (claro byte-idéntico)
- [x] 2.2 Convertir secciones desktop `{Inicio, QuienesSomos, Coleccion, Reformas, Opiniones, Contacto}` y móvil `{Inicio, QuienesSomos, Coleccion, Reformas, Opiniones, Contacto}` a tokens
- [x] 2.3 No tocar Vision ni CompareSlider; verificar que los archivos quedan sin diff

## 3. Toggle pulido y contextual

- [x] 3.1 Rediseñar `ThemeToggle` con SVG sol/luna, pill 44×44 y variantes `floating` (vidrio, foto) / `solid` (token)
- [x] 3.2 Header PC: variante `floating` en Inicio y `solid` en el resto; móvil `solid`
- [x] 3.3 Catálogo: mismo flex row que "Volver a AREA LRMQ", el enlace manda la posición
- [x] 3.4 Tests de variantes e iconos actualizados

## 4. Asistente contextual

- [x] 4.1 Atributo `data-lrmq-context` en LandingPage con limpieza al desmontar
- [x] 4.2 Burbuja de bienvenida translúcida con blur sobre foto (ambos temas) y sólida fuera, con hooks CSS
- [x] 4.3 Auditoría del disparador documentada en tests (delay, descarte por sesión, auto-hide con pausa)

## 5. Imágenes y controles oscuros

- [x] 5.1 Suavizado dark (`brightness .9 saturate .92`) opt-in `lrmq-dark-soften` en cards, galería, lightbox, card del asistente y presupuesto; sin cambios de media
- [x] 5.2 Verificar que Vision/hero conservan su apariencia

## 6. Validación y entrega

- [x] 6.1 Suite completa en verde (370 passed | 1 skipped), lint 0 errores, typecheck y build OK
- [x] 6.2 Matriz de capturas light/dark × rutas (portada, catálogo, ficha, presupuesto, 404) + secciones landing dark + móvil 390; evidencia en `/tmp/opencode/darkmatrix-*.png`, `darkdot-*.png`, `light-nav-check.png`, `toggle-clip.png`
- [x] 6.3 Informe `docs/audit/dark-theme-contrast-review.md` con límites (revisión real del propietario pendiente)
- [x] 6.4 Commit y push solo con instrucción explícita del propietario
