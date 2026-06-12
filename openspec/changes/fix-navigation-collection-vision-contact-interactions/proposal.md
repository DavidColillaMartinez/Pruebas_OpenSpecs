## Why

La navegación lateral de desktop existe visualmente, pero no se puede usar para saltar de sección ni da feedback útil al pasar por cada punto. Además, varias microinteracciones recientes necesitan ajuste: Colección obliga a demasiados gestos para mostrar contenido relacionado, el replay de Visión queda mal ubicado y no comunica bien recarga, y los iconos de Contacto no se leen como canales reales ni animan de forma fiable.

## What Changes

- **Navegación lateral desktop**: convertir cada bolita en un botón accesible que navega a su sección mediante `navigateTo`. Al hacer hover/focus sobre una bolita, el texto inferior cambia al nombre de esa sección con una transición fluida; al quitar hover/focus, vuelve suavemente al nombre de la sección activa.
- **Colección desktop**: mantener intactas las apariciones de `Vidrio templado` y `Textura mineral`. Cambiar los tres bloques siguientes para que se disparen con una sola acción de scroll, apareciendo en orden con delay/stagger interno, sin requerir un scroll por bloque.
- **Visión desktop**: mover el botón replay a la esquina inferior derecha para que no se corte ni compita con otros overlays. Repasar su animación para que el icono de recarga gire claramente en hover/focus.
- **Contacto**: rediseñar los iconos inline para que WhatsApp, Instagram y mapa se entiendan de inmediato y no se fusionen visualmente. Reparar las animaciones hover/focus de todos los canales: WhatsApp, teléfono, Instagram y ubicación.
- **Git hygiene**: cuando se implemente, verificar build, commitear con `DavidColillaMartinez <davicete45@gmail.com>` y hacer push a `origin/main`.

## Capabilities

### New Capabilities
- `desktop-side-nav-interaction`: interacción, hover/focus label y navegación por click/teclado del navegador lateral de bolitas.
- `collection-grouped-stagger`: aparición agrupada con stagger para los últimos bloques de Colección desktop, manteniendo intactos los primeros dos bloques.
- `vision-replay-placement-motion`: ubicación inferior derecha y animación de recarga fiable para el botón replay de Visión desktop.
- `contact-channel-icon-motion`: iconografía SVG legible y animaciones hover/focus funcionales para los canales de Contacto.

### Modified Capabilities
- (ninguna; no hay specs raíz existentes en `openspec/specs/`).

## Impact

- `src/App.jsx`: convertir `ChapterDots` de spans pasivos a botones interactivos, recibir `onNavigate`, estado hover/focus para el label mostrado y transiciones del texto.
- `src/hooks/useNarrativeScroll.js`: reutilizar `navigateTo`; no se esperan cambios salvo que haga falta limpiar bloqueo/cooldown al navegar por bolitas.
- `src/sections/desktop/Coleccion.jsx`: ajustar umbrales/clases de los bloques posteriores a `Textura mineral` para activarse desde un único `step` con delays escalonados.
- `src/sections/desktop/Vision.jsx`: mover replay a `bottom-3 right-3`, revisar markup/clases del SVG de recarga.
- `src/components/ContactIcon.jsx`: simplificar y corregir SVGs de WhatsApp, Instagram y mapa para que no se fusionen visualmente.
- `src/components/ContactLinks.jsx` y `src/sections/mobile/Contacto.jsx`: asegurar que todos los enlaces usan los iconos corregidos y clases `group` necesarias para animación.
- `src/styles/utilities.css`: ajustar keyframes, selectors hover/focus y reduced-motion para replay y contact icons.
- Sin dependencias nuevas.
